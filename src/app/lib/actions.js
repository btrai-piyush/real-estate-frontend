import { authApi } from '@/api/api';

export async function authenticate(prevState, formData) {
    const email = String(formData?.get('email') || '');
    const password = String(formData?.get('password') || '');
    const rememberMeRaw = formData?.get('rememberMe');
    const rememberMe = rememberMeRaw === 'on' || rememberMeRaw === 'true' || rememberMeRaw === true;

    try {
        await authApi.login({ email, password, rememberMe });
    } catch (error) {
        const message = String(error?.message || '').toLowerCase();
        const causeMessage = String(error?.cause?.err?.message || error?.cause?.message || '').toLowerCase();

        if (
            message.includes('invalid credentials') ||
            message.includes('unauthorized') ||
            causeMessage.includes('invalid credentials') ||
            causeMessage.includes('unauthorized')
        ) {
            return 'Invalid credentials';
        }

        if (causeMessage.includes('unable to connect to server')) {
            return 'Unable to connect to server';
        }

        if (error instanceof Error) {
            return 'Something went wrong';
        }

        throw error;
    }
}