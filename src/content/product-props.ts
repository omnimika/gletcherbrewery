/**
 * Product specs + localized copy for catalog detail pages.
 * Source: production RU/EN product pages scraped 31.10.2026
 * (`tmp/product-scrape/`, filled into `tmp/Gletcher beer categories and props.csv`).
 *
 * Architecture: locale-invariant `specs` + per-locale `copy` / `slugs`.
 * Planned locales beyond ru/en: sr, hy, ka, de (see ADR 0001).
 * `malts` / `hops` / `style` stored in CapitalCase (Title Case; IPA/APA/EBC/R.I.S. kept;
 * camelCase brands like MelaBeech preserved).
 */

export type AppLocale = "ru" | "en" | "sr" | "hy" | "ka" | "de";

/** Locales currently published on production. */
export const ACTIVE_LOCALES = ["ru", "en"] as const satisfies readonly AppLocale[];

/** Locales planned; content may be empty until translation. */
export const PLANNED_LOCALES = ["sr", "hy", "ka", "de"] as const satisfies readonly AppLocale[];

export type LocalizedText = Partial<Record<AppLocale, string>> & { ru?: string; en?: string };

export type ProductBadgeFlag = "new" | "alcofree" | "discontinued";

export type ProductSpecs = {
  /** ABV percent as published (comma decimal), e.g. "5,2" */
  abv: string;
  /** Original gravity / density as published; may be "N/A" */
  og: string;
  ibu: string;
  /** CapitalCase style name */
  style: string;
  /** CapitalCase malt list */
  malts: string;
  /** CapitalCase hop list */
  hops: string;
  bottleVol: string;
  /** Empty when keg volume not shown on product page (Observed: Cynic, Hop Dragon). */
  kegVol?: string;
};

export type ProductCopy = {
  taste: LocalizedText;
  about: LocalizedText;
  foodPairing: LocalizedText;
  fermentation: LocalizedText;
};

export type ProductProps = {
  id: string;
  category: "CLASSIC" | "CRAFT" | "LIMITED" | "AGED";
  title: string;
  /** URL path segment per locale; missing locale falls back to `ru` or `en` via resolver. */
  slugs: Partial<Record<AppLocale, string>> & { ru: string; en: string };
  badges: ProductBadgeFlag[];
  specs: ProductSpecs;
  copy: ProductCopy;
};

export const PRODUCT_PROPS: ProductProps[] = [
  {
    id: "ausweis",
    category: "CLASSIC",
    title: "Ausweis",
    slugs: { ru: "ausweis", en: "ausweis" },
    badges: [],
    specs: {
      abv: "5,2",
      og: "13",
      ibu: "15",
      style: "Weisbier",
      malts: "Wheat Malt, Pilsner, Munich Malt, Caramel Malt",
      hops: "Bobek",
      bottleVol: "0,5",
      kegVol: "20",
    },
    copy: {
      taste: { ru: "Полное тело, завершающееся нотками спелого банана, гармоничная вкусо-ароматическая композиция", en: "Full body, ending with notes of ripe banana, harmonious flavor and aromatic composition" },
      about: { ru: "Откройте для себя пшеничный сорт пива Ausweis – настоящий шедевр, созданный из натуральных ингредиентов премиального качества. Получился настоящий золотой стандарт: вода, солод и хмель премиального качества. Основу составили ингредиенты из Германии: четыре солода с идеально сбалансированными параметрами цвета и ферментации, а также умеренно горький и ароматный словенский хмель Bobek Styrian Golding.", en: "A new wheat variety brewed strictly according to the Rheinheitsgebot Beer purity Law of 1516. It turned out to be a real gold standard: water, malt and hops of premium quality. The basis was made up of ingredients from Germany: four malts with perfectly balanced color and fermentation parameters, as well as moderately bitter and aromatic Slovenian hops Bobek Styrian Golding." },
      foodPairing: { ru: "морепродукты и рыба, выдержанный сыр, банановый пирог", en: "seafood and fish, aged cheese, banana pie" },
      fermentation: { ru: "Верховое брожжение", en: "Top fermentation" },
    },
  },
  {
    id: "heidegger-hell",
    category: "CLASSIC",
    title: "Heidegger Hell",
    slugs: { ru: "heidegger-hell", en: "heidegger-hell" },
    badges: [],
    specs: {
      abv: "4,7",
      og: "12",
      ibu: "18",
      style: "Helles Lager",
      malts: "Pilsner Malt",
      hops: "Nugget, Aurora, Bobek",
      bottleVol: "0,5",
      kegVol: "20",
    },
    copy: {
      taste: { ru: "Искрящийся, освежающий лагер с лёгкой солодовой сладостью и утонченной хмелевой горчинкой", en: "Sparkling, refreshing lager with a light malt sweetness and subtle hop bitterness" },
      about: { ru: "Классическое светлое пиво низового брожения для истинных ценителей старых немецких традиций. Благородный солод Pilsner, горький немецкий хмель Nugget, ароматный древесно-хвойный хмель Aurora, а также выразительный цветочно-сосновый хмель Bobek Styrian Golding, выращенный на альпийских склонах центральной Словении. Великолепно подойдёт к простым немецким блюдам.", en: "Classic light beer of low fermentation for true connoisseurs of old German traditions. Noble Pilsner malt, bitter German Nugget hops, fragrant woody-coniferous Aurora hops, as well as expressive floral-pine Bobek Styrian Golding hops grown on the alpine slopes of central Slovenia. It will perfectly match simple German dishes." },
      foodPairing: { ru: "рулька, колбаска вайсвурст, брёцель", en: "pig shank, weiswurst sausage, brezel" },
      fermentation: { ru: "НИЗОВОЕ брожение", en: "Bottom fermentation" },
    },
  },
  {
    id: "rouge-de-fleur",
    category: "CLASSIC",
    title: "Rouge de Fleur",
    slugs: { ru: "rouge-de-fleur", en: "rouge-de-fleur" },
    badges: [],
    specs: {
      abv: "3,8",
      og: "11,5",
      ibu: "7",
      style: "Kriek",
      malts: "Pilsner Malt",
      hops: "Bobek",
      bottleVol: "0,5",
      kegVol: "20",
    },
    copy: {
      taste: { ru: "Фруктовый букет, начинающийся со свежей сладости и заканчивающийся тонкой кислинкой", en: "A fruity bouquet starting with fresh sweetness and ending with a subtle sourness" },
      about: { ru: "Великолепно сбалансированный, игристый и освежающий «крикенбир». Изучив все тонкости и секреты производства этого напитка, мы сварили свое вишневое пиво, по вкусу и качеству не уступающее бельгийскому. Стоит его попробовать, и вас тут же захватит аромат дикой вишни, танцуя бельгийскую чечетку на стенках бокала.", en: "A superbly balanced, sparkling and refreshing \"krikenbir\". Having studied all the subtleties and secrets of the production of this drink, we brewed our cherry beer, which is not inferior to Belgian in taste and quality. It is worth trying it, and you will immediately be captured by the aroma of wild cherries, dancing a Belgian tap dance on the walls of a glass." },
      foodPairing: { ru: "десерты, тёмный шоколад, сыр чеддер", en: "desserts, dark chokolate, cheddar cheese" },
      fermentation: { ru: "Верховое брожение", en: "Top fermentation" },
    },
  },
  {
    id: "milk-of-amnesia-non-alco",
    category: "CRAFT",
    title: "Milk of Amnesia non-alcoholic",
    slugs: { ru: "milk-of-amnesia-non-alco", en: "milk-of-amnesia-non-alco" },
    badges: ["new", "alcofree"],
    specs: {
      abv: "0,5",
      og: "N/A",
      ibu: "22",
      style: "Milkshake IPA",
      malts: "Pilsner Malt, Crystal Malt, Wheat Malt",
      hops: "Styrian Wolf, Mosaic",
      bottleVol: "0,5",
      kegVol: "20",
    },
    copy: {
      taste: { ru: "Умеренно сладкий, округлый и полнотелый вкус, благодаря насыщенной фруктовой основе", en: "Moderately sweet, rounded and full-bodied taste, thanks to the rich fruit base" },
      about: { ru: "Мы знаем, что жизнь требует драйва 24/7. Руль, спорт, важные встречи – иногда алкоголь просто не вписывается в график. Но разве это означает, что нужно забыть о вкусе любимого крафта?", en: "We know that life requires 24/7 drive. Driving, sports, important meetings – sometimes alcohol just doesn't fit into the schedule. But does this mean that you need to forget about the taste of your favorite craft?" },
      foodPairing: { ru: "сыры с плесенью, азиатская кухня, том ям, мясо гриль", en: "tom yam soup, asian cuisine, grill meat" },
      fermentation: { ru: "Верховое брожение", en: "Top fermentation" },
    },
  },
  {
    id: "milk-of-amnesia-v-tropic",
    category: "CRAFT",
    title: "Milk of Amnesia",
    slugs: { ru: "milk-of-amnesia-v-tropic", en: "milk-of-amnesia" },
    badges: [],
    specs: {
      abv: "5,5",
      og: "14,3",
      ibu: "28",
      style: "Milkshake IPA",
      malts: "Pilsner Malt, Crystal Malt, Wheat Malt",
      hops: "Nugget, Columbus, Centenial, Mosaic",
      bottleVol: "0,5",
      kegVol: "20",
    },
    copy: {
      taste: { ru: "Умеренно сладкий, округлый и полнотелый вкус, благодаря насыщенной фруктовой основе", en: "Moderately sweet, rounded and full-bodied taste, thanks to the rich fruit base" },
      about: { ru: "После феноменального успеха нашей «тропической амнезии» в 2018 году, мы решили включить этот напиток в постоянную линейку. По-прежнему остался дух бунтарства от наших друзей из", en: "After the phenomenal success of our \"tropical amnesia\" in 2018, we decided to include this drink in the permanent line. There is still a spirit of rebellion from our friends from the Anarchy Brew Co. (Great Britain), and we boldly mixed pineapple, mango and passion fruit juices, flavoring it with another portion of lactose. For the fragrance and to continue the bitterness, which depicted a nugget, Columbus, a Century and a mosaic." },
      foodPairing: { ru: "сыры с плесенью, пряные блюда, бургеры", en: "fermented cheese, spiced dishes, burgers" },
      fermentation: { ru: "Верховое брожение", en: "Top fermentation" },
    },
  },
  {
    id: "brainstorm",
    category: "CRAFT",
    title: "Brainstorm",
    slugs: { ru: "brainstorm", en: "brainstorm-apa-alcohol-free" },
    badges: ["alcofree"],
    specs: {
      abv: "0,5",
      og: "N/A",
      ibu: "23",
      style: "Nonalcoholic APA",
      malts: "Pilsner Malt, Avangard",
      hops: "Mosaic",
      bottleVol: "0,5",
      kegVol: "20",
    },
    copy: {
      taste: { ru: "Несмотря на отсутствие градусов, отличается полным, насыщенным вкусом и ярким ароматом, присущим стилю АРА", en: "Despite the lack of degrees, it is characterized by a full, rich taste and bright aroma inherent in the MACAW style" },
      about: { ru: "Это безалкогольное освежающее пиво с великолепным вкусом, которое ничем не уступает своим собратьям, обладающим крепостью. Сочетание светлого ячменного солода от Avangard и американского хмеля Mosaic. Настоящий кладезь полезных веществ, витаминов А, С, D, калия, магния, кальция, железа, кремния, и всего, что понадобится для бодрости тела, силы духа и ясности ума. Пиво легко пьется и подойдет для всех случаев, когда необходимо воздержаться от алкоголя.", en: "This is a non-alcoholic refreshing beer with a great taste, which is in no way inferior to its counterparts with strength. A combination of light barley malt from Avangard and American Mosaic hops. A real storehouse of useful substances, vitamins A, C, D, potassium, magnesium, calcium, iron, silicon, and everything you need for body vigor, fortitude and mental clarity. Beer is easy to drink and is suitable for all cases when it is necessary to abstain from alcohol." },
      foodPairing: { ru: "сыр горгонзола, свиные рёбрышки, индийская кухня", en: "gorgonzola cheese, pork ribs, indian cuisine" },
      fermentation: { ru: "Верховое брожение", en: "Top fermentation" },
    },
  },
  {
    id: "blue-monkey",
    category: "CRAFT",
    title: "Blue Monkey",
    slugs: { ru: "blue-monkey", en: "blue-monkey" },
    badges: [],
    specs: {
      abv: "5,4",
      og: "12,7",
      ibu: "10",
      style: "Wheat Ale",
      malts: "Pale Ale, MelaBeech",
      hops: "Bobek",
      bottleVol: "0,5",
      kegVol: "20",
    },
    copy: {
      taste: { ru: "Эль с приятной кислинкой и хмелевой горчинкой, фруктовый, чуть пряный, с гвоздичными и банановыми оттенками", en: "Ale with a pleasant sourness and hop bitterness, fruity, slightly spicy, with clove and banana shades" },
      about: { ru: "Лёгкое пшеничное пиво с выразительным гармоничным ароматом и мягким сладковатым послевкусием. В основе напитка использовано три вида солода, а пряный кориандр и цитрусовая цедра наделяют напиток утонченным, изящным, освежающим весенним букетом. Лучше всего этот эль сочетается с блюдами из рыбы, а также морепродуктами.", en: "A light wheat beer with an expressive harmonious aroma and a mild sweet aftertaste. The drink is based on three types of malt, and spicy coriander and citrus peel give the drink a refined, elegant, refreshing spring bouquet. This ale is best combined with fish dishes, as well as seafood." },
      foodPairing: { ru: "фрукты, белая рыба, морепродукты", en: "fruits, white fish, seafood" },
      fermentation: { ru: "Верховое брожение", en: "Top fermentation" },
    },
  },
  {
    id: "nut-butter",
    category: "CRAFT",
    title: "Nut Butter",
    slugs: { ru: "nut-butter", en: "nut-butter" },
    badges: [],
    specs: {
      abv: "5,5",
      og: "14",
      ibu: "35",
      style: "Nut Brown Ale",
      malts: "Cara Dark Malt, Cara 120, Special B, Golden Naked Oats",
      hops: "Magnum, Aurora, Fuggle",
      bottleVol: "0,5",
      kegVol: "20",
    },
    copy: {
      taste: { ru: "Пиво дымно-орехового цвета, Являясь родственником классического эля, отличается более ощутимой горечью, ароматом и плотностью", en: "The smoky-nutty beer, Being a relative of the classic ale, has a more noticeable bitterness, aroma and density" },
      about: { ru: "Изучать британский сорт браун-эль мы начали совместно с одной из старейших пивоварен Великобритании —", en: "We started studying the British brown ale variety together with one of the oldest breweries in the UK — Shepherd Neame, and we managed to preserve the unique qualities of this drink. Its sweetness does not deafen the confectionery, but gradually reveals a moderate hop bitterness and turns into a fragrant nutty trail. During fermentation, natural Italian nut extract is added, which was exclusively developed for our brewery." },
      foodPairing: { ru: "лосось на гриле, рваная говядина, сыры и десерты", en: "grilled salmon, torn beef, cheeses and desserts" },
      fermentation: { ru: "Верховое брожение", en: "Top fermentation" },
    },
  },
  {
    id: "bowler-ipa",
    category: "CRAFT",
    title: "Bowler IPA",
    slugs: { ru: "bowler-ipa", en: "bowler-ipa" },
    badges: [],
    specs: {
      abv: "6,1",
      og: "14,5",
      ibu: "70",
      style: "Indian Pale Ale",
      malts: "Pale Ale, MelaBeech",
      hops: "Styrian Wolf, Chinook, Mosaic, Cascade",
      bottleVol: "0,5",
      kegVol: "20",
    },
    copy: {
      taste: { ru: "Являясь родственником классического эля, отличается более ощутимой горечью, ароматом и плотностью", en: "Being a relative of the classic ale, it has a more noticeable bitterness, aroma and density" },
      about: { ru: "Этот эль сварен в американском стиле с использованием хмеля из США. Результат — янтарь в бокале с выраженной горечью в послевкусии. Особого внимания заслуживает аромат, в букете которого гармонируют цитрусовые, цветочные, сосновые и фруктовые ноты. Он достигается методом «сухого охмеления», когда в конце варки добавляют ещё хмели Cascade и Мosaic.", en: "This ale is brewed in the American style using hops from the USA. The result is amber in a glass with a pronounced bitterness in the aftertaste. The fragrance deserves special attention, in the bouquet of which citrus, floral, pine and fruit notes are in harmony. It is achieved by the method of \"dry hopping\", when at the end of cooking Cascade and Mosaic hops are added." },
      foodPairing: { ru: "десерты, азиатская кухня, бургеры", en: "desserts, asian cuisine, burgers" },
      fermentation: { ru: "Верховое брожение", en: "Top fermentation" },
    },
  },
  {
    id: "underground-ale",
    category: "CRAFT",
    title: "Underground Ale",
    slugs: { ru: "underground-ale", en: "underground-ale" },
    badges: [],
    specs: {
      abv: "4,7",
      og: "11,8",
      ibu: "27",
      style: "Ale",
      malts: "Pilsner Malt, Cara 120",
      hops: "Styrian Wolf, Cascade",
      bottleVol: "0,5",
      kegVol: "20",
    },
    copy: {
      taste: { ru: "Ощутимо солодовый вкус со смолистыми и карамельными нотами и легкой хмелевой горчинкой", en: "A palpably malty taste with resinous and caramel notes and a slight hop bitterness" },
      about: { ru: "Традиционный английский эль с удивительным янтарным оттенком, получающимся благодаря бельгийскому карамельному солоду Cara 120. В середине кипячения мы добавили словенский цветочно-фруктовый хмель Styrian Wolf, а в конце варки и на «сухом охмелении» — американский горько- ароматный Cascade. К такому пиву предпочитают классические английские закуски: жареную свинину, ростбиф и знаменитые фиш-энд-чипс.", en: "A traditional English ale with an amazing amber hue, obtained thanks to the Belgian caramel malt Cara 120. In the middle of boiling, we added Slovenian Styrian Wolf floral and fruit hops, and at the end of cooking and on \"dry hopping\" - the American bittersweet Cascade. Classic English snacks are preferred for this beer: roast pork, roast beef and the famous fish and chips." },
      foodPairing: { ru: "фиш энд чипс, жареная свинина, ростбиф", en: "fish and chips, roast pork, roast beef" },
      fermentation: { ru: "Верховое брожение", en: "Top fermentation" },
    },
  },
  {
    id: "friday-avenue-apa",
    category: "CRAFT",
    title: "Friday Avenue",
    slugs: { ru: "friday-avenue-apa", en: "friday-avenue-apa" },
    badges: [],
    specs: {
      abv: "4,7",
      og: "11,7",
      ibu: "21",
      style: "American Pale Ale",
      malts: "Pale Ale, White Classiс, Oat",
      hops: "Mosaic",
      bottleVol: "0,5",
      kegVol: "20",
    },
    copy: {
      taste: { ru: "Обновлённый чуть терпкий вкус, благодаря нотам спелого ананаса, сочного манго и весенних цветов", en: "An updated slightly tart taste, thanks to notes of ripe pineapple, juicy mango and spring flowers" },
      about: { ru: "Мир меняется, и наш Friday Avenue вместе с ним. На проспекте вечной пятницы наступила весна и расцвели цветы. Мы оставили столь любимый всеми вкус, но освежили его американским хмелем Мosaic. Тело напитка осталось легким и сладковатым. Верховое брожение лучше сбалансировало горечь и полностью раскрыло богатую ароматику. И, конечно, мы не забыли про «сухое охмеление», чтобы сделать пиво идеальным.", en: "The world is changing, and our Friday Avenue is changing with it. Spring has come and flowers have bloomed on Eternal Friday Avenue. We left the taste so beloved by everyone, but refreshed it with American Mosaic hops. The body of the drink remained light and sweet. Top fermentation better balanced the bitterness and fully revealed the rich aromatics. And, of course, we did not forget about the \"dry hopping\" to make the beer perfect." },
      foodPairing: { ru: "пряный сыр, чизбургер, банановый сплит", en: "spicy cheese, cheeseburger, banana split" },
      fermentation: { ru: "Верховое брожение", en: "Top fermentation" },
    },
  },
  {
    id: "iron-woods-dry-stout",
    category: "CRAFT",
    title: "Iron Woods Dry Stout",
    slugs: { ru: "iron-woods-dry-stout", en: "iron-woods-dry-stout" },
    badges: [],
    specs: {
      abv: "4,8",
      og: "11",
      ibu: "20",
      style: "Dry Stout",
      malts: "Crystal Malt, Chocolate Malt, Black Malt, Corn Flakes",
      hops: "Savinski Golding, Nugget",
      bottleVol: "0,5",
      kegVol: "20",
    },
    copy: {
      taste: { ru: "СУХОЙ стаут с нотами карамели, кофейной жжёнки и пряности, а также тонким травяным ароматом хмеля", en: "DRY stout with notes of caramel, burnt coffee and spices, as well as a subtle herbal aroma of hops" },
      about: { ru: "Главный секрет этого стаута — благородная рецептура, в которой виртуозно соединили шесть специальных солодов. Вкус пропитан породой и характером, а кремообразная, плотная и невероятно вкусная пена гордой лавиной бурлит в стакане. Отлично сочетается с устрицами, барбекю, сырами, а также фруктовыми и шоколадными десертами. Если же заказать бокал отдельно, он сыграет мощное соло хорошего пивного вечера.", en: "The main secret of this stout is a noble recipe, in which six special malts were masterfully combined. The taste is saturated with rock and character, and creamy, dense and incredibly delicious foam is bubbling like an avalanche in a glass. It goes well with oysters, barbecue, cheeses, as well as fruit and chocolate desserts. If you order a glass separately, he will play a powerful solo of a good beer evening." },
      foodPairing: { ru: "вяленое мясо, устрицы, шоколадный пудинг", en: "dried meat, oysters, chocolate pudding" },
      fermentation: { ru: "Верховое брожение", en: "Top fermentation" },
    },
  },
  {
    id: "iron-woods-milk-stout",
    category: "CRAFT",
    title: "Iron Woods Milk Stout",
    slugs: { ru: "iron-woods-milk-stout", en: "iron-woods-milk-stout" },
    badges: ["discontinued"],
    specs: {
      abv: "6,5",
      og: "17,5",
      ibu: "10",
      style: "Milk Stout",
      malts: "Pilsner Malt, Cara Malt, Cara Light Malt, Chocolate Malt, Black Malt",
      hops: "Savinski Golding",
      bottleVol: "0,5",
      kegVol: "20",
    },
    copy: {
      taste: { ru: "Десертный стаут С МЯГКИМ СЛИВОЧНЫМ ВКУСОМ С НОТКАМИ кофе, ШОКОЛАДА, ВАНИЛИ И ЛЁГКОЙ КАРАМЕЛЬНОЙ СЛАДОСТЬЮ", en: "Dessert stout WITH A SOFT CREAMY TASTE WITH NOTES OF coffee, CHOCOLATE, VANILLA AND LIGHT CARAMEL SWEETNESS" },
      about: { ru: "Iron Woods Milk Stout – следующая ступень эволюции нашего классического стаута. В приготовлении мы использовали лактозу, которая в комбинации с карамельными и шоколадными солодами дала мягкий сливочный вкус с нотками шоколада и кофе. Хмель добавлялся очень аккуратно, чтобы не сбить насыщенную ароматику солодов, но благодаря ему можно уловить слегка фруктовые ноты. Послевкусие сопровождает легкая сладость с оттенками карамели и бисквита.", en: "Iron Woods Milk Stout is the next step in the evolution of our classic stout. In the preparation, we used lactose, which in combination with caramel and chocolate malts gave a soft creamy taste with hints of chocolate and coffee. The hops were added very carefully so as not to knock down the rich aromatics of the malts, but thanks to it you can catch slightly fruity notes. The aftertaste is accompanied by a light sweetness with hints of caramel and sponge cake." },
      foodPairing: { ru: "мороженое, говядина барбекю, мягкие сыры, профитроли", en: "ice cream, barbecue beef, profiteroles" },
      fermentation: { ru: "Верховое брожение", en: "Top fermentation" },
    },
  },
  {
    id: "ruby-road",
    category: "CRAFT",
    title: "Ruby Road",
    slugs: { ru: "ruby-road", en: "ruby-road" },
    badges: [],
    specs: {
      abv: "7",
      og: "18",
      ibu: "15",
      style: "Strong Cherry Ale",
      malts: "Pilsner, Cara120, Wheat Malt",
      hops: "Bobek",
      bottleVol: "0,5",
      kegVol: "20",
    },
    copy: {
      taste: { ru: "Выразительные 7% с фруктово-вишневым, древесным, немного танинным, чуть травянистым букетом", en: "Expressive 7% with a fruity cherry, woody, slightly tannic, slightly herbaceous bouquet" },
      about: { ru: "Крепкий вишневый эль – новинка, которую ждали все знатоки стиля. Душистая вишня солирует приятным ароматом: ошеломительным, искрометным каскадом кисловато-сладких оттенков вкуса и долгим, утонченным, неповторимым цитрусовым послевкусием. Наиболее полно раскрывается в сочетании с такими блюдами, как мясо гриль, ветчина и различные мягкие сыры.", en: "Strong cherry ale is a novelty that all connoisseurs of style have been waiting for. Fragrant cherries have a pleasant aroma: a stunning, sparkling cascade of sour-sweet flavors and a long, refined, unique citrus aftertaste. It is most fully revealed in combination with dishes such as grilled meat, ham and various soft cheeses." },
      foodPairing: { ru: "мягкий сыр, ветчина, салаты", en: "soft cheese, ham, salads" },
      fermentation: { ru: "Верховое брожение", en: "Top fermentation" },
    },
  },
  {
    id: "brut-grapefruit",
    category: "LIMITED",
    title: "Brut Grapefruit",
    slugs: { ru: "brut-grapefruit", en: "brut-grapefruit" },
    badges: ["discontinued"],
    specs: {
      abv: "6,3",
      og: "15",
      ibu: "10",
      style: "Brut Ale",
      malts: "Pilsner Malt, Wheat Malt, Caramel Malt",
      hops: "Bobek",
      bottleVol: "0,5",
      kegVol: "20",
    },
    copy: {
      taste: { ru: "сухой вкусовой профиль, присущая", en: "dry taste profile,sparkling wine inherent in champagne and balanced taste with a slight bitterness of grapefruit" },
      about: { ru: "Наш яркий, легкий, искристый эль с ароматом", en: "Our bright, light, sparkling ale with the aroma" },
      foodPairing: { ru: "овощные салаты, морепродукты, рыбные блюда", en: "pie, seafood, fish dishes" },
      fermentation: { ru: "Верховое брожение", en: "Top fermentation" },
    },
  },
  {
    id: "hop-dragon",
    category: "LIMITED",
    title: "Hop Dragon",
    slugs: { ru: "hop-dragon", en: "hop-dragon" },
    badges: ["discontinued"],
    specs: {
      abv: "8",
      og: "18",
      ibu: "100",
      style: "Double Hopped IPA",
      malts: "Pale Ale, Medium",
      hops: "Citra, Mosaic, Columbus, Sorachi Ace, Centennial",
      bottleVol: "0,5",
    },
    copy: {
      taste: { ru: "Характерная для двойных IPA легкая сладость с приятной свежестью, сбалансированной хмелевой горечИ", en: "A light sweetness characteristic of double IPAs with a pleasant freshness, balanced hop bitterness" },
      about: { ru: "В честь года Дракона мы решили создать пиво Hop Dragon и, таким образом, отдать дань уважения легендарному напитку шаолиньских мастеров, любивших варить его по особому рецепту. Матово-медовый оттенок нефильтрованного тела идеально контрастирует с плотной снежно-белой пеной, а яркий аромат пяти хмелей подчеркивает экзотические нотки цитруса и маракуйи, напоминающие об индийских корнях сорта.", en: "In honor of the year of the Dragon, we decided to create a Hop Dragon beer and, thus, pay tribute to the legendary drink of the Shaolin masters who loved to brew it according to a special recipe. The matte honey shade of the unfiltered body perfectly contrasts with the dense snow-white foam, and the bright aroma of five hops emphasizes the exotic notes of citrus and passion fruit, reminiscent of the Indian roots of the variety." },
      foodPairing: { ru: "крылышки в кисло-сладком соусе, мексиканские тако, индийская кухня", en: "chic wings in sweet and sour sauce, Mexican tacos, Indian cuisine" },
      fermentation: { ru: "Верховое брожение", en: "Top fermentation" },
    },
  },
  {
    id: "tour-de-grapefruit",
    category: "LIMITED",
    title: "Tour de Grapefruit",
    slugs: { ru: "tour-de-grapefruit", en: "tour-de-grapefruit" },
    badges: ["new"],
    specs: {
      abv: "5,4",
      og: "12,7",
      ibu: "10",
      style: "Fruit Wheat Ale",
      malts: "Pilsner Malt, Wheat Malt, Oat Malt",
      hops: "Bobek",
      bottleVol: "0,5",
      kegVol: "20",
    },
    copy: {
      taste: { ru: "Пшеничное «пушистое» пиво со свежим вкусом и выраженным цитрусово-хмелевым ароматом", en: "Wheat \"fluffy\" beer with a fresh taste and a pronounced citrus-hop aroma" },
      about: { ru: "На сегодняшний день пшеничный эль – это один из самых популярных стилей для крафтовых экспериментов. Мы решили поддержать тренд и создали собственную интерпретацию, сделав его более ярким, и в то же время, универсальным. А наша изюминка – это натуральный сок красного грейпфрута с острова Барбадос, благодаря которому эль получился невероятно освежающим и сбалансированным. Tour de Grapefruit прекрасно подойдет как для веселой дружеской вечеринки на краю света, так и для уютных семейных посиделок дома.", en: "Today, wheat ale is one of the most popular styles for craft experiments. We decided to support the trend and created our own interpretation, making it more vivid and at the same time universal. And our highlight is the natural juice of red grapefruit from the island of Barbados, which makes the ale incredibly refreshing and balanced. The Tour de Grapefruit is perfect for a fun and friendly party at the edge of the world, as well as for cozy family gatherings at home." },
      foodPairing: { ru: "овощные салаты, морепродукты, рыбные блюда", en: "fresh salad, seafood, fish dishes" },
      fermentation: { ru: "Верховое брожение", en: "Top fermentation" },
    },
  },
  {
    id: "cynic",
    category: "AGED",
    title: "CYNIC",
    slugs: { ru: "cynic", en: "cynic" },
    badges: ["new"],
    specs: {
      abv: "12",
      og: "25",
      ibu: "35",
      style: "R.I.S.",
      malts: "Pale Ale Avanguard, Cara 120 & Special B Dingemans, Oat Malt, Roast Malt 900 EBC, Roast Malt 1200 EBC",
      hops: "Magnum, Avrora, Bobek",
      bottleVol: "0,33",
    },
    copy: {
      taste: { ru: "МЯГКИЙ КОНЬЯЧНЫЙ АРОМАТ, ГЛУБОКИЙ насыщенныЙ ПРЯНЫЙ вкус, бескомпромиссныЙ императорскиЙ характер", en: "The mild cognac aroma, deep rich spicy taste, uncompromising imperial character" },
      about: { ru: "Русский Имперский Стаут от Пивоварни Глетчер был сварен в июне 2023 года из 6 сортов солода и 3 сортов хмеля. 365 дней пиво выдерживалось в бродильном танке. В июле 2024 г. стаут разлили в бочки из лимузенского дуба из под 25-летнего коньяка премиальной линейки «Н. Некрасов», от Новокубанского Коньячного завода. Благодаря 7 месячной выдержке во французской дубовой бочке напиток со временем приобрёл уникальные насыщенные и стойкие нотки во вкусе и аромате. Весь процесс шёл максимально натурально: без ускорителей, добавок или искусственных ароматизаторов. Только время, дерево и пиво.", en: "The Russian Imperial Stout from the Glacier Brewery was brewed in June 2023 from 6 malt and 3 hop varieties. The beer was aged in a fermentation tank for 365 days. In July 2024, the stout was poured into barrels of Limousin oak from the 25-year-old cognac of the premium line \"N. Nekrasov\", from the Novokubansky Brandy Factory. Due to 7 months of aging in a French oak barrel, the drink eventually acquired unique rich and persistent notes in taste and aroma. The whole process was as natural as possible: without accelerators, additives or artificial flavors. Just time, wood, and beer." },
      foodPairing: { ru: "мороженое, красное мясо, брауни, выдержанный сыр", en: "ice-cream, red meat, brauny, aged cheese" },
      fermentation: { ru: "Верховое брожение", en: "Top fermentation" },
    },
  },
];

export function getProductProps(idOrSlug: string): ProductProps | undefined {
  return PRODUCT_PROPS.find(
    (p) => p.id === idOrSlug || p.slugs.ru === idOrSlug || p.slugs.en === idOrSlug,
  );
}

export function productPath(product: ProductProps, locale: AppLocale = "ru"): string {
  const slug = product.slugs[locale] ?? product.slugs.en ?? product.slugs.ru;
  if (locale === "ru") return `/beer/${slug}`;
  return `/${locale}/beer/${slug}`;
}

export function pickLocalized(
  value: LocalizedText,
  locale: AppLocale,
  fallback: AppLocale = "en",
): string {
  return value[locale] || value[fallback] || value.ru || value.en || "";
}
