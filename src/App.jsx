import React, { useState, useEffect } from 'react';
import { Search, Map, ArrowLeft, ExternalLink } from 'lucide-react';
import './App.css';

function App() {
  const [countries, setCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null); // Nouvel état pour le pays cliqué

  // 1. Récupération des données après le 1er rendu (useEffect)
  useEffect(() => {
    // Afin de ne pas surcharger l'API et éviter l'Erreur 400, on demande 
    // uniquement les champs spécifiques dont on a besoin. (Ajout de plus de champs pour les détails)
    fetch('https://restcountries.com/v3.1/all?fields=name,flags,population,region,subregion,capital,translations,languages,currencies,borders')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCountries(data);
        } else {
          console.error("Erreur de format depuis l'API:", data);
        }
      })
      .catch((err) => console.error("Erreur de récupération : ", err));
  }, []); // [] = s'exécute uniquement au chargement

  // 2. Application des filtres sur la liste complète
  const filteredCountries = Array.isArray(countries) ? countries.filter((country) => {
    if (!country || !country.name || !country.name.common) return false;
    
    // Fonction utilitaire pour enlever les accents et mettre en minuscules
    const normalizeText = (text) => {
      if (!text) return '';
      return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    };

    const searchClean = normalizeText(searchTerm);
    
    // On récupère toutes les traductions possibles pour être sûr de ne rien rater
    const nameEng = normalizeText(country.name?.common || '');
    const nameFr = normalizeText(country.translations?.fra?.common || '');
    const nameNative = normalizeText(country.name?.nativeName ? Object.values(country.name.nativeName)[0]?.common : '');
    
    // Correspondance sur le nom entier
    const matchesSearch = nameEng.includes(searchClean) || nameFr.includes(searchClean) || nameNative.includes(searchClean);
    
    // Correspondance sur le continent (région) - traduit en FR ou tel quel
    const matchesRegion = selectedRegion ? country.region === selectedRegion : true;
    
    return matchesSearch && matchesRegion;
  }) : [];

  return (
    <div className="App">
      <header className="header">
        <div className="header-content">
          <h1><Map className="icon-title" size={36} /> Explorateur de Pays</h1>
        </div>
      </header>
      
      <main>
        {selectedCountry ? (
          /* VUE DÉTAILLÉE DU PAYS (BIOGRAPHIE) */
          <section className="country-details">
            <button className="back-btn" onClick={() => setSelectedCountry(null)}>
              <ArrowLeft size={20} /> Retour à la liste
            </button>
            <div className="details-wrapper">
              <div className="details-container">
                <img src={selectedCountry.flags.svg || selectedCountry.flags.png} alt={`Drapeau de ${selectedCountry.name.common}`} className="details-flag" />
                
                <div className="details-info">
                  <h2>{selectedCountry.translations?.fra?.common || selectedCountry.name.common}</h2>
                  
                  <div className="details-grid">
                  <div className="details-column">
                    <p><strong>Nom natif :</strong> {selectedCountry.name.nativeName ? Object.values(selectedCountry.name.nativeName)[0]?.common : 'N/A'}</p>
                    <p><strong>Population :</strong> {selectedCountry.population ? selectedCountry.population.toLocaleString() : 'N/A'}</p>
                    <p><strong>Continent :</strong> {
                      { 'Africa': 'Afrique', 'Americas': 'Amériques', 'Asia': 'Asie', 'Europe': 'Europe', 'Oceania': 'Océanie' }[selectedCountry.region] || selectedCountry.region || 'N/A'
                    }</p>
                    <p><strong>Sous-région :</strong> {
                      { 
                        'Northern Europe': 'Europe du Nord', 
                        'Western Europe': 'Europe de l\'Ouest', 
                        'Southern Europe': 'Europe du Sud', 
                        'Eastern Europe': 'Europe de l\'Est',
                        'Northern Africa': 'Afrique du Nord',
                        'Western Africa': 'Afrique de l\'Ouest',
                        'Middle Africa': 'Afrique Centrale',
                        'Eastern Africa': 'Afrique de l\'Est',
                        'Southern Africa': 'Afrique du Sud',
                        'North America': 'Amérique du Nord',
                        'South America': 'Amérique du Sud',
                        'Central America': 'Amérique Centrale',
                        'Caribbean': 'Caraïbes',
                        'Eastern Asia': 'Asie de l\'Est',
                        'South-Eastern Asia': 'Asie du Sud-Est',
                        'Southern Asia': 'Asie du Sud',
                        'Western Asia': 'Asie de l\'Ouest',
                        'Central Asia': 'Asie Centrale',
                        'Australia and New Zealand': 'Australie et Nouvelle-Zélande',
                        'Melanesia': 'Mélanésie',
                        'Micronesia': 'Micronésie',
                        'Polynesia': 'Polynésie'
                      }[selectedCountry.subregion] || selectedCountry.subregion || 'N/A'
                    }</p>
                    <p><strong>Capitale :</strong> {selectedCountry.capital && selectedCountry.capital.length > 0 ? selectedCountry.capital[0] : 'N/A'}</p>
                  </div>
                  <div className="details-column">
                    <p><strong>Langues (locales) :</strong> {
                      selectedCountry.languages 
                        ? Object.entries(selectedCountry.languages).map(([code, name]) => {
                            // Dictionnaire des langues les plus courantes pour la traduction
                            const langMap = {
                              'eng': 'Anglais', 'fra': 'Français', 'spa': 'Espagnol', 'deu': 'Allemand', 
                              'por': 'Portugais', 'ita': 'Italien', 'nld': 'Néerlandais', 'jpn': 'Japonais', 
                              'zho': 'Chinois', 'rus': 'Russe', 'ara': 'Arabe', 'hin': 'Arabe', 'tur': 'Turc', 'kor': 'Coréen'
                            };
                            return langMap[code] || name;
                          }).join(', ') 
                        : 'N/A'
                    }</p>
                    <p><strong>Monnaie(s) :</strong> {
                      selectedCountry.currencies 
                        ? Object.values(selectedCountry.currencies).map(c => {
                            // Petit dictionnaire pour traduire les monnaies communes
                            const currencyMap = {
                              'Euro': 'Euro', 'United States dollar': 'Dollar américain', 'British pound': 'Livre sterling',
                              'Japanese yen': 'Yen japonais', 'Swiss yen': 'Franc suisse', 'Canadian dollar': 'Dollar canadien',
                              'Australian dollar': 'Dollar australien', 'New Zealand dollar': 'Dollar néo-zélandais',
                              'Chinese yuan': 'Yuan chinois', 'Indian rupee': 'Roupie indienne', 'Brazilian real': 'Réal brésilien',
                              'Russian ruble': 'Rouble russe', 'South African rand': 'Rand sud-africain', 'Mexican real': 'Peso mexicain' 
                            };
                            const translatedName = currencyMap[c.name] || c.name;
                            return `${translatedName} (${c.symbol})`;
                          }).join(', ') 
                        : 'N/A'
                    }</p>
                    <p><strong>Bordures (codes pays) :</strong> {selectedCountry.borders ? selectedCountry.borders.join(', ') : 'Aucune (Île/Isolé)'}</p>
                  </div>
                </div>

                  <a 
                    href={`https://fr.wikipedia.org/wiki/${selectedCountry.translations?.fra?.common || selectedCountry.name.common}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="wiki-link"
                  >
                    <ExternalLink size={20} /> Lire la biographie complète sur Wikipedia
                  </a>
                </div>
              </div>
            </div>
          </section>
        ) : (
          /* VUE GRILLE DE RECHERCHE CLASSIQUE */
          <>
            {/* Barre d'outils (Recherche + Filtre) */}
            <section className="search-filter-container">
              <div className="search-wrapper">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Rechercher un pays..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select 
                className="region-select" 
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                <option value="">Filtrer par Continent</option>
                <option value="Africa">Afrique</option>
                <option value="Americas">Amériques</option>
                <option value="Asia">Asie</option>
                <option value="Europe">Europe</option>
                <option value="Oceania">Océanie</option>
              </select>
            </section>

            {/* Compteur de pays (se met à jour en direct) */}
            <div className="countries-count">
              {filteredCountries.length} pays trouvé{filteredCountries.length > 1 ? 's' : ''}
            </div>

            {/* Grille des pays */}
            <section className="countries-grid">
              {Array.isArray(filteredCountries) && filteredCountries.map((country, index) => {
                const flag = country?.flags?.png || '';
                // On essaie d'afficher le nom en français par défaut, sinon anglais
                const name = country?.translations?.fra?.common || country?.name?.common || 'Inconnu';
                const population = country?.population ? country.population.toLocaleString() : 'N/A';
                
                // Traduction manuelle basique des régions
                const regionMap = { 'Africa': 'Afrique', 'Americas': 'Amériques', 'Asia': 'Asie', 'Europe': 'Europe', 'Oceania': 'Océanie' };
                const region = regionMap[country?.region] || country?.region || 'N/A';
                
                // Sécurité pour la capitale qui peut être vide ou ne pas exister
                let capital = 'N/A';
                if (Array.isArray(country.capital) && country.capital.length > 0) {
                  capital = country.capital[0];
                } else if (typeof country.capital === 'string') {
                  capital = country.capital;
                }

                return (
                  // Ajout de l'événement onClick pour ouvrir les détails
                  <article key={index} className="country-card" onClick={() => setSelectedCountry(country)}>
                    <img src={flag} alt={`Drapeau de ${name}`} className="flag-img" />
                    <div className="card-content">
                      <h2>{name}</h2>
                      <p><strong>Population :</strong> {population}</p>
                      <p><strong>Continent :</strong> {region}</p>
                      <p><strong>Capitale :</strong> {capital}</p>
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;