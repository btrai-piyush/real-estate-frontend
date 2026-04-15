import {Inter} from '@next/font/google';
import {Lusitana} from '@next/font/google';
import {Nunito} from '@next/font/google';
import {JetBrains_Mono} from '@next/font/google';

export const lusitana = Lusitana({
  subsets: ['latin'],
    weight: ['400', '700']
});

export const inter = Inter({
  subsets: ['latin']
});

export const nunito = Nunito({
  subsets: ['latin'],
  weight: ['200','300', '400', '600', '700', '800', '900']
});

export const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300'],
});