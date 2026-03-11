import type { Localized } from '../types';

type LocationContentOverride = {
  summary?: Localized;
  description?: Localized;
  directions?: Localized;
};

export const locationContentOverrides: Record<string, LocationContentOverride> = {
  'portixol-el-molinar': {
    summary: {
      de: 'Portixol und El Molinar gehören zu den beliebtesten Vierteln am Meer in Palma. Entlang der Promenade findest du Cafés, Restaurants und kleine Läden, während Altstadt und Flughafen schnell erreichbar sind.',
      en: 'Portixol and El Molinar are among Palma’s most desirable seafront neighbourhoods. The promenade is lined with cafés, restaurants and small shops, while the old town and the airport are both close by.',
      es: 'Portixol y El Molinar están entre los barrios marítimos más deseados de Palma. El paseo reúne cafés, restaurantes y pequeños comercios, y tanto el casco antiguo como el aeropuerto están muy cerca.',
    },
    description: {
      de: 'Portixol und El Molinar liegen direkt an der Bucht von Palma und verbinden entspanntes Leben am Meer mit kurzen Wegen in die Stadt. Die Promenade eignet sich ideal zum Spazieren, Joggen oder Radfahren, und entlang des Wassers reihen sich Cafés, Restaurants und kleine Treffpunkte für den ganzen Tag aneinander.\n\nDie Altstadt von Palma ist in wenigen Minuten mit dem Taxi, Bus oder Fahrrad erreichbar. Gleichzeitig findest du im Viertel alles, was für einen unkomplizierten Aufenthalt wichtig ist: Supermarkt, Apotheke, Bäckereien und viele gute Adressen für Frühstück, Lunch oder einen Abend direkt am Wasser.',
      en: 'Portixol and El Molinar sit right on the Bay of Palma, combining relaxed seafront living with quick access to the city. The promenade is ideal for walking, jogging or cycling, and the waterfront is lined with cafés, restaurants and easy-going spots from morning to night.\n\nPalma’s old town is only a short taxi, bus or bike ride away. At the same time, the neighbourhood covers the essentials for an easy stay: supermarkets, pharmacies, bakeries and plenty of good options for breakfast, lunch or dinner by the sea.',
      es: 'Portixol y El Molinar se sitúan junto a la bahía de Palma y combinan un estilo de vida relajado frente al mar con una conexión rápida al centro. El paseo marítimo es ideal para caminar, correr o ir en bici, y a lo largo del agua encontrarás cafés, restaurantes y rincones agradables durante todo el día.\n\nEl casco antiguo de Palma queda a pocos minutos en taxi, autobús o bicicleta. Al mismo tiempo, el barrio ofrece todo lo necesario para una estancia cómoda: supermercado, farmacia, panaderías y muchas buenas direcciones para desayunar, comer o cenar junto al mar.',
    },
    directions: {
      de: 'Vom Flughafen Palma erreichst du Portixol / El Molinar in der Regel in etwa 10 bis 15 Minuten mit dem Taxi, abhängig vom Verkehr. Alternativ verbindet eine Buslinie das Viertel mit dem Zentrum von Palma.\n\nVor Ort kannst du viele Wege zu Fuß oder mit dem Fahrrad zurücklegen, besonders entlang der Promenade Richtung Altstadt.',
      en: 'From Palma airport, Portixol / El Molinar is usually reached in around 10 to 15 minutes by taxi, depending on traffic. There is also a bus connection into Palma and the surrounding neighbourhoods.\n\nOnce you are there, many routes are easy to do on foot or by bike, especially along the promenade towards the old town.',
      es: 'Desde el aeropuerto de Palma, normalmente se llega a Portixol / El Molinar en unos 10 a 15 minutos en taxi, según el tráfico. También hay conexión en autobús con el centro de Palma y los barrios cercanos.\n\nUna vez allí, muchos trayectos se pueden hacer fácilmente a pie o en bicicleta, especialmente por el paseo marítimo hacia el casco antiguo.',
    },
  },
};
