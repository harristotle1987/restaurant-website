import Head from 'next/head'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import About from '../components/sections/About'
import Menu from '../components/sections/Menu'
import Specials from '../components/sections/Specials'
import Gallery from '../components/sections/Gallery'
import Contact from '../components/sections/Contact'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Gourmet House | Fine Dining</title>
        <meta name="description" content="Premium restaurant experience" />
      </Head>

      <Navbar />
      
      <main className="flex-grow">
        <div className="relative h-screen">
          {/* Hero Section */}
          <div className="absolute inset-0 bg-gray-200 border-2 border-dashed" />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Gourmet House</h1>
              <p className="text-xl mb-8">Exquisite dining since 2010</p>
              <button className="bg-restaurant-primary px-8 py-3 rounded-md text-lg hover:bg-opacity-90">
                Book a Table
              </button>
            </div>
          </div>
        </div>
        
        <About />
        <Menu />
        <Specials />
        <Gallery />
        <Contact />
      </main>
      
      <Footer />
    </div>
  )
}