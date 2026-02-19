// This file is used to silence TypeScript errors in VS Code when the Deno extension is not installed.
// It declares the 'Deno' namespace as any, allowing the code to compile in a standard Node/TS environment.
// In the actual Supabase Runtime, the real Deno global will be used.

declare const Deno: {
    env: {
        get(key: string): string | undefined;
        toObject(): { [key: string]: string };
    };
    // Add other Deno methods if needed
    [key: string]: any;
};
