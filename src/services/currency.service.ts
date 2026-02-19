import { Injectable, signal, computed } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CurrencyService {
    // Signal for the current currency configuration
    private currencyConfig = signal({
        code: 'EUR',
        symbol: '€',
        locale: 'pt-PT'
    });

    constructor() {
        this.detectCurrency();
    }

    private detectCurrency() {
        const lang = navigator.language || 'pt-PT';
        if (lang.toLowerCase().includes('br') || lang.toLowerCase().includes('pt-br')) {
            this.currencyConfig.set({
                code: 'BRL',
                symbol: 'R$',
                locale: 'pt-BR'
            });
        } else {
            this.currencyConfig.set({
                code: 'EUR',
                symbol: '€',
                locale: 'pt-PT'
            });
        }
    }

    get symbol() {
        return this.currencyConfig().symbol;
    }

    get code() {
        return this.currencyConfig().code;
    }

    /**
     * Formats a number as currency based on detected or set locale.
     * @param value The value in units (e.g., 1.50)
     */
    format(value: number): string {
        const config = this.currencyConfig();
        return new Intl.NumberFormat(config.locale, {
            style: 'currency',
            currency: config.code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }

    /**
     * Just returns the symbol and the value formatted but without the "currency" style which can sometimes be bulky.
     * Example: "1,50€" or "R$ 1,50"
     */
    formatSimple(value: number): string {
        const config = this.currencyConfig();
        const formattedValue = new Intl.NumberFormat(config.locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);

        return config.code === 'BRL'
            ? `${config.symbol} ${formattedValue}`
            : `${formattedValue}${config.symbol}`;
    }
}
