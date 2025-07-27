import {
	IconArmchair,
	IconBallFootball,
	IconBed,
	IconBike,
	IconBottle,
	IconBrandApple,
	IconBrandBluesky,
	IconBrandJuejin,
	IconBread,
	IconCamera,
	IconCar,
	IconCat,
	IconCoffee,
	IconCooker,
	IconDeviceLaptop,
	IconDeviceTv,
	IconDog,
	IconEyeglass,
	IconGlass,
	IconHanger,
	IconHeadphones,
	IconHeartbeat,
	IconIceCream,
	IconJewishStar,
	IconMeat,
	IconMotorbike,
	IconPhone,
	IconPill,
	IconShirt,
	IconShoe,
	IconToolsKitchen,
} from '@tabler/icons-react'

export const BRAND_CATEGORY_ICONS = {
	MODA: 'moda',
	ALIMENTOS: 'alimentos',
	TECH: 'tech',
	HOGAR: 'hogar',
	SALUD: 'salud',
	DEPORTES: 'deportes',
	BELLEZA: 'belleza',
	JUGUETES: 'juguetes',
	LIBROS: 'libros',
	MASCOTAS: 'mascotas',
	AUTOMOTRIZ: 'automotriz',
	CONSTRUCCION: 'construccion',
	OFICINA: 'oficina',
	JARDINERIA: 'jardineria',
}

export const PRODUCT_BRAND_ICONS = [
	// Moda
	{ value: 'IconShoe', label: 'Zapatillas', icon: IconShoe, category: BRAND_CATEGORY_ICONS.MODA },
	{ value: 'IconTshirt', label: 'Ropa', icon: IconShirt, category: BRAND_CATEGORY_ICONS.MODA },
	{ value: 'IconHanger', label: 'Moda', icon: IconHanger, category: BRAND_CATEGORY_ICONS.MODA },
	{ value: 'IconEyeglass', label: 'Accesorios', icon: IconEyeglass, category: BRAND_CATEGORY_ICONS.MODA },
	{ value: 'IconJewelry', label: 'Joyeria', icon: IconJewishStar, category: BRAND_CATEGORY_ICONS.MODA },

	// Alimentos
	{ value: 'IconBottle', label: 'Bebida', icon: IconBottle, category: BRAND_CATEGORY_ICONS.ALIMENTOS },
	{ value: 'IconGlass', label: 'Bebidas', icon: IconGlass, category: BRAND_CATEGORY_ICONS.ALIMENTOS },
	{ value: 'IconCoffee', label: 'Café', icon: IconCoffee, category: BRAND_CATEGORY_ICONS.ALIMENTOS },
	{ value: 'IconMeat', label: 'Carnes', icon: IconMeat, category: BRAND_CATEGORY_ICONS.ALIMENTOS },
	{ value: 'IconBread', label: 'Panadería', icon: IconBread, category: BRAND_CATEGORY_ICONS.ALIMENTOS },
	{ value: 'IconIceCream', label: 'Helados', icon: IconIceCream, category: BRAND_CATEGORY_ICONS.ALIMENTOS },

	// Tecnología
	{ value: 'IconBrandApple', label: 'Apple', icon: IconBrandApple, category: BRAND_CATEGORY_ICONS.TECH },
	{ value: 'IconDeviceLaptop', label: 'Computadoras', icon: IconDeviceLaptop, category: BRAND_CATEGORY_ICONS.TECH },
	{ value: 'IconPhone', label: 'Celulares', icon: IconPhone, category: BRAND_CATEGORY_ICONS.TECH },
	{ value: 'IconHeadphones', label: 'Audio', icon: IconHeadphones, category: BRAND_CATEGORY_ICONS.TECH },
	{ value: 'IconTV', label: 'Televisores', icon: IconDeviceTv, category: BRAND_CATEGORY_ICONS.TECH },
	{ value: 'IconCamera', label: 'Fotografía', icon: IconCamera, category: BRAND_CATEGORY_ICONS.TECH },

	// Hogar
	{ value: 'IconArmchair', label: 'Muebles', icon: IconArmchair, category: BRAND_CATEGORY_ICONS.HOGAR },
	{ value: 'IconBed', label: 'Dormitorio', icon: IconBed, category: BRAND_CATEGORY_ICONS.HOGAR },
	{ value: 'IconCooker', label: 'Electrodomésticos', icon: IconCooker, category: BRAND_CATEGORY_ICONS.HOGAR },
	{ value: 'IconToolsKitchen', label: 'Cocina', icon: IconToolsKitchen, category: BRAND_CATEGORY_ICONS.HOGAR },

	// Salud
	{ value: 'IconPill', label: 'Farmacia', icon: IconPill, category: BRAND_CATEGORY_ICONS.SALUD },
	{ value: 'IconHeartbeat', label: 'Cuidado Personal', icon: IconHeartbeat, category: BRAND_CATEGORY_ICONS.SALUD },

	// Deportes
	{ value: 'IconBallFootball', label: 'Fútbol', icon: IconBallFootball, category: BRAND_CATEGORY_ICONS.DEPORTES },
	{ value: 'IconBike', label: 'Ciclismo', icon: IconBike, category: BRAND_CATEGORY_ICONS.DEPORTES },

	// Belleza
	{
		value: 'IconBrandNivea',
		label: 'Cuidado de la Piel',
		icon: IconBrandBluesky,
		category: BRAND_CATEGORY_ICONS.BELLEZA,
	},
	{ value: 'IconBrandLoreal', label: 'Cabello', icon: IconBrandJuejin, category: BRAND_CATEGORY_ICONS.BELLEZA },

	// Mascotas
	{ value: 'IconDog', label: 'Perros', icon: IconDog, category: BRAND_CATEGORY_ICONS.MASCOTAS },
	{ value: 'IconCat', label: 'Gatos', icon: IconCat, category: BRAND_CATEGORY_ICONS.MASCOTAS },

	// Automotriz
	{ value: 'IconCar', label: 'Autos', icon: IconCar, category: BRAND_CATEGORY_ICONS.AUTOMOTRIZ },
	{ value: 'IconMotorbike', label: 'Motos', icon: IconMotorbike, category: BRAND_CATEGORY_ICONS.AUTOMOTRIZ },
]
