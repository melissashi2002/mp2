import { BrowserRouter, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import { PokemonProvider } from './context/PokemonContext';
import DetailView from './pages/DetailView';
import GalleryView from './pages/GalleryView';
import ListView from './pages/ListView';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <PokemonProvider>
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<ListView />} />
            <Route path="/gallery" element={<GalleryView />} />
            <Route path="/pokemon/:id" element={<DetailView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </PokemonProvider>
    </BrowserRouter>
  );
}
