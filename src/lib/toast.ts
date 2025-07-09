// Simple toast-like feedback using browser notifications or console
export const showToast = {
  success: (message: string) => {
    console.log('✅ Success:', message)
    // You can replace this with a proper toast library later
  },
  error: (message: string) => {
    console.error('❌ Error:', message)
    // You can replace this with a proper toast library later
  },
  loading: (message: string) => {
    console.log('⏳ Loading:', message)
    // You can replace this with a proper toast library later
  },
  info: (message: string) => {
    console.log('ℹ️ Info:', message)
    // You can replace this with a proper toast library later
  },
}

export const showOperationToast = {
  loading: (operation: string) => showToast.loading(`${operation}...`),
  success: (operation: string) => showToast.success(`${operation} successful!`),
  error: (operation: string, error?: string) => showToast.error(`${operation} failed${error ? `: ${error}` : ''}`),
}
