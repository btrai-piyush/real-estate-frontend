import React from 'react';
import { MapPin, Repeat, Heart,Map } from 'lucide-react';
import { nunito } from '../fonts';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectPropertyCompared,
  selectPropertyFavorites,
  togglePropertyCompare,
  togglePropertyFavorite,
} from '@/app/redux/property/propertySlice';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const ListingCard = ({
  propertyId,
  imageUrl,
  price,
  type,
  title,
  address,
  // beds,
  // baths,
  sqft,
  agentName,
  agentAvatar,
  postedAt,
  isFeatured,
  saleOption,
  latitude,
  longitude,
}) => {
  const dispatch = useDispatch();
  const favorites = useSelector(selectPropertyFavorites);
  const compared = useSelector(selectPropertyCompared);
  const isFavorite = favorites.includes(propertyId);
  const isCompared = compared.includes(propertyId);

  const lat = Number.parseFloat(latitude);
  const lng = Number.parseFloat(longitude);
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);

  const tooltipSuffix = String(propertyId ?? title ?? 'listing').replace(/[^a-zA-Z0-9_-]/g, '');
  const mapIconTooltipId = `map-icon-tooltip-${tooltipSuffix || 'item'}`;

  const mapTooltipMessage = hasCoordinates
    ? 'Open this property in Google Maps'
    : 'Location coordinates unavailable';

  return (
    <div className={` ${nunito.className} w-full bg-white rounded-lg  hover:shadow-xl transition-transform duration-300 overflow-hidden border border-slate-200`}>
      {/* Image Section */}
      <div className="relative h-52 sm:h-60 xl:h-64">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover p-2.5 rounded-2xl"
        />
        {/* <div className="absolute m-2.5 rounded-sm inset-0 bg-[linear-gradient(180deg,rgba(9,16,29,0.2)_0%,rgba(9,16,29,0.2)_42%,rgba(9,16,29,0.66)_100%)]" /> */}
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {isFeatured && (
            <span className="bg-gray-800 bg-opacity-80 text-white text-xs font-medium px-2.5 py-1 rounded">
              Featured
            </span>
          )}
          {saleOption && (
            <span className="bg-red-600 bg-opacity-80 text-white text-xs font-medium px-2.5 py-1 rounded">
              For {saleOption}
            </span>
          )}
        </div>
        
        {/* Price Overlay */}
        <div className="absolute bottom-4 left-4">
          <div className="text-white drop-shadow-md flex items-baseline gap-0.5">
            <span className="text-xl font-bold text-shadow-lg/70 text-shadow-black  px-2 py-1.5 leading-none">Rs.{price}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-4 right-4 flex gap-2.5">
          <button
            onClick={() => dispatch(togglePropertyCompare(propertyId))}
            className={`transition-all p-2 rounded-lg backdrop-blur-md border ${
              isCompared
                ? 'bg-[#3e4c66]/85 border-white/20 text-white'
                : 'bg-black/35 hover:bg-black/50 border-white/10 text-white'
            }`}
            aria-label="Toggle compare"
          >
            <Repeat size={15} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => dispatch(togglePropertyFavorite(propertyId))}
            className={`transition-all p-2 rounded-lg backdrop-blur-md border ${
              isFavorite
                ? 'bg-[#ff6b6b]/85 border-white/20 text-white'
                : 'bg-black/35 hover:bg-black/50 border-white/10 text-white'
            }`}
            aria-label="Toggle favorite"
          >
            <Heart size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 pt-4 sm:px-5">
        <span className="text-[#ff6b6b] text-base font-medium mb-1 block">{type}</span>
        <h3 className="text-[#1a2b3c] text-lg sm:text-xl font-bold mb-1 tracking-tight leading-tight break-words">{title}</h3>
        
        <div className="flex items-center gap-2 text-[#717171] mb-2">
          <MapPin
            size={17}
            className="shrink-0 text-[#717171]/80"
            data-tooltip-id={mapIconTooltipId}
            data-tooltip-content={mapTooltipMessage}
          />
          <p className="text-sm sm:text-[15.5px] font-normal leading-relaxed break-words">{address}</p>
          <button
            type="button"
            disabled={!hasCoordinates}
            data-tooltip-id={mapIconTooltipId}
            data-tooltip-content={mapTooltipMessage}
            onClick={() => {
              if (hasCoordinates) {
                window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
              }
            }}
            className={`transition-transform ${hasCoordinates ? 'cursor-pointer hover:scale-120' : 'cursor-not-allowed opacity-60'}`}
            aria-label="Open location in Google Maps"
          >
            <Map size={20} className="shrink-0 text-[#717171]/80" />
          </button>
          <Tooltip id={mapIconTooltipId} place="top" />
        </div>

        <div className="flex flex-wrap items-center text-[#484848]">
          {/* <div className="flex items-center gap-1.5">
            <span className="text-base text-[#717171]">Beds:</span>
            <span className="text-base font-semibold">{beds}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base text-[#717171]">Baths:</span>
            <span className="text-base font-semibold">{baths}</span>
          </div> */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-base text-[#717171]">SqFt:</span>
            <span className="text-base font-semibold">{sqft}</span>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="px-4 py-4 sm:px-5 sm:py-5 border-t border-gray-100 bg-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={agentAvatar}
              alt={agentName}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-inner ring-1 ring-gray-100"
            />
            <span className="truncate font-semibold text-base sm:text-lg text-[#1f2937]">{agentName}</span>
          </div>
          <span className="shrink-0 text-[#929292] text-sm sm:text-base">{postedAt}</span>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
