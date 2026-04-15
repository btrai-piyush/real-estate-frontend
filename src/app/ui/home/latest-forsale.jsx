'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ListingCard from '@/app/ui/listings/listing-card';
import { propertyApi } from '@/api/api';
import { ListingGridSkeleton } from '@/app/ui/skeletons';

const MAX_ITEMS = 12;
const FALLBACK_COVER_IMAGE =
  'https://www.publicdomainpictures.net/pictures/100000/velka/new-home-for-sale-1405784329d8m.jpg';
const PROPERTY_IMAGE_BASE_URL = 'https://localhost:7018/api/uploads/property_images';
const DEFAULT_AGENT_AVATAR =
  'https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=is&k=20&c=XmEKmysBRbA1o6zWBHLRaX2j_nrYVvdVZjuXPBLuOOo=';

const formatPostedAt = (dateValue) => {
  if (!dateValue) {
    return '';
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return parsedDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getDisplayAddress = (property) => {
  const directAddress = typeof property.address === 'string' ? property.address.trim() : '';
  if (directAddress) {
    return directAddress;
  }

  const city = typeof property.city === 'string' ? property.city.trim() : '';
  const state = typeof property.state === 'string' ? property.state.trim() : '';
  const merged = [city, state].filter(Boolean).join(', ');

  return merged || 'Location unavailable';
};

const getListingPrice = (property) => {
  const numericPrice = Number(property.price) || 0;
  if (numericPrice <= 0) {
    return 'N/A';
  }

  return numericPrice.toLocaleString();
};

const getListingImageUrl = (property) => {
  const coverValue = typeof property.coverPhoto === 'string' ? property.coverPhoto.trim() : '';

  if (!coverValue || coverValue === 'no-image-available') {
    return FALLBACK_COVER_IMAGE;
  }

  if (coverValue.startsWith('http://') || coverValue.startsWith('https://')) {
    return coverValue;
  }

  return `${PROPERTY_IMAGE_BASE_URL}/${coverValue}`;
};

export default function LatestForSale() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [itemsPerView, setItemsPerView] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const getItemsPerView = () => {
      if (window.innerWidth >= 1280) {
        return 4;
      }
      if (window.innerWidth >= 768) {
        return 2;
      }
      return 1;
    };

    const updateItemsPerView = () => {
      setItemsPerView(getItemsPerView());
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);

    return () => {
      window.removeEventListener('resize', updateItemsPerView);
    };
  }, []);

  useEffect(() => {
    const maxIndex = Math.max(properties.length - itemsPerView, 0);
    setCurrentIndex((previousIndex) => Math.min(previousIndex, maxIndex));
  }, [properties, itemsPerView]);

  useEffect(() => {
    let mounted = true;

    const fetchLatestForSale = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await propertyApi.getLatestBySaleOption('sale');
        const data = Array.isArray(response) ? response : response ? [response] : [];

        if (!mounted) {
          return;
        }

        setProperties(data.slice(0, MAX_ITEMS));
      } catch (fetchError) {
        if (!mounted) {
          return;
        }

        setProperties([]);
        setError(fetchError?.message || 'Could not load latest properties sale.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchLatestForSale();

    return () => {
      mounted = false;
    };
  }, []);

  const maxIndex = Math.max(properties.length - itemsPerView, 0);
  const canScroll = properties.length > itemsPerView;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < maxIndex;

  return (
    <section className="pb-12 pt-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 sm:text-4xl">Latest sale</h2>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">Newly listed homes ready to buy.</p>
        </div>

        {canScroll && (
          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => setCurrentIndex((previousIndex) => Math.max(previousIndex - 1, 0))}
              disabled={!canGoPrev}
              className="rounded-full border border-slate-300 bg-white p-2 text-slate-600 transition hover:border-slate-400 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous properties"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setCurrentIndex((previousIndex) => Math.min(previousIndex + 1, maxIndex))}
              disabled={!canGoNext}
              className="rounded-full border border-slate-300 bg-white p-2 text-slate-600 transition hover:border-slate-400 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next properties"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {loading && <ListingGridSkeleton count={4} />}

      {!loading && error && (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && properties.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          No sale properties available right now.
        </div>
      )}

      {!loading && !error && properties.length > 0 && (
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="-mx-3 flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${(currentIndex * 100) / itemsPerView}%)` }}
            >
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="w-full shrink-0 px-3"
                  style={{ flex: `0 0 ${100 / itemsPerView}%` }}
                >
                  <ListingCard
                    propertyId={property.id}
                    price={getListingPrice(property)}
                    type={property.type}
                    title={property.title}
                    address={getDisplayAddress(property)}
                    sqft={property.area}
                    agentName={property.addedBy || 'Unknown Agent'}
                    agentAvatar={DEFAULT_AGENT_AVATAR}
                    postedAt={formatPostedAt(property.addedOn)}
                    isFeatured={property.isFeatured}
                    saleOption={property.saleOption}
                    imageUrl={getListingImageUrl(property)}
                    latitude={property.latitude}
                    longitude={property.longitude}
                  />
                </div>
              ))}
            </div>
          </div>

          {canScroll && (
            <div className="mt-5 flex items-center justify-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => setCurrentIndex((previousIndex) => Math.max(previousIndex - 1, 0))}
                disabled={!canGoPrev}
                className="rounded-full border border-slate-300 bg-white p-2 text-slate-600 transition hover:border-slate-400 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous properties"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentIndex((previousIndex) => Math.min(previousIndex + 1, maxIndex))}
                disabled={!canGoNext}
                className="rounded-full border border-slate-300 bg-white p-2 text-slate-600 transition hover:border-slate-400 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next properties"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
