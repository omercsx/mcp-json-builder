import { AppLayout, MobileTabNav } from '@/components/layout'
import useMediaQuery from '@/hooks/use-media-query'

import { Toaster } from 'sonner'

function App() {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  return (
    <>
      {isDesktop ? <AppLayout /> : <MobileTabNav />}
      <Toaster position="bottom-right" />
    </>
  )
}

export default App
