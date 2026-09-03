-- Al Ain products seed (run after products-slug-category.sql)
BEGIN;

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  '6x250ml-aa-shrink-lime-sparkling-can', 'premium-range', NULL, '[]'::jsonb,
  '6x250ml AA Shrink Lime Sparkling Can', '6x250ml AA Shrink Lime Sparkling Can', '', '',
  13.57, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/PrimaryImagesFOP-01.jpg?v=1757582108', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/LimeSecondaryInformation.jpg?v=1757582108","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-02.jpg?v=1757582107","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-03.jpg?v=1757582108","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-04.jpg?v=1757582108","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-05.jpg?v=1757582107"]'::jsonb,
  true, false, true, 999, 1, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-alkaline-water-330ml-pack-of-12', 'functional-water', NULL, '[]'::jsonb,
  'Al Ain Alkaline Water 330ml Pack of 12', 'Al Ain Alkaline Water 330ml Pack of 12', '', '',
  8.57, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/330mlENwithshrink.jpg?v=1771493255', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/330mlEN.jpg?v=1771493255","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/330mlARwithshrink.jpg?v=1771493255","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/330mlAR.jpg?v=1771493255"]'::jsonb,
  true, false, true, 999, 2, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-alkaline-water-1-5l-pack-of-6', 'functional-water', NULL, '[]'::jsonb,
  'Al Ain Alkaline Water 1.5L Pack of 6', 'Al Ain Alkaline Water 1.5L Pack of 6', '', '',
  8.57, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/1.5LENwithshrink.jpg?v=1771491757', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/1.5LEN.jpg?v=1771491757","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/1.5LARwithshrink.jpg?v=1771491757","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/1.5LAR.jpg?v=1771491757"]'::jsonb,
  true, false, true, 999, 3, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-alkaline-water-500ml-pack-of-12', 'functional-water', NULL, '[]'::jsonb,
  'Al Ain Alkaline Water 500ml Pack of 12', 'Al Ain Alkaline Water 500ml Pack of 12', '', '',
  8.57, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/500mlENwithshrink.jpg?v=1771491032', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/500mlEN.jpg?v=1771491031","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/500mlARwithshrink.jpg?v=1771491031","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/500mlAR.jpg?v=1771491032"]'::jsonb,
  true, false, true, 999, 4, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  '6x250ml-aa-shrink-strawberry-sparkling-can', 'premium-range', NULL, '[]'::jsonb,
  '6x250ml AA Shrink Strawberry Sparkling Can', '6x250ml AA Shrink Strawberry Sparkling Can', '', '',
  13.57, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/PrimaryImagesFOP-02.jpg?v=1757582220', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-06.jpg?v=1757582220","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-07.jpg?v=1757582222","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-08.jpg?v=1757582220","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-09.jpg?v=1757582221","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-10.jpg?v=1757582221"]'::jsonb,
  true, false, true, 999, 5, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-bottled-drinking-water-4-gallon', 'bottled-water', NULL, '[]'::jsonb,
  'Al Ain Bottled Drinking Water 4 Gallon', 'Al Ain Bottled Drinking Water 4 Gallon', '', '',
  14, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/4-Gallon-Regular-E1594117333.jpg?v=1738216296', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/4-Gallon-Regular-A1594117371.jpg?v=1738216339"]'::jsonb,
  true, false, true, 999, 6, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-zero-bottled-drinking-water-4-gallon', 'functional-water', NULL, '[]'::jsonb,
  'Al Ain Zero Bottled Drinking Water 4 Gallon', 'Al Ain Zero Bottled Drinking Water 4 Gallon', '', '',
  16, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/4-Gallon-Zero-E1594118756.jpg?v=1738216574', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/4-Gallon-Zero-A1594118756.jpg?v=1738216591"]'::jsonb,
  true, false, true, 999, 7, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  '6x250ml-aa-shrink-plain-sparkling-can', 'premium-range', NULL, '[]'::jsonb,
  '6x250ml AA Shrink Plain Sparkling Can', '6x250ml AA Shrink Plain Sparkling Can', '', '',
  12.86, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/PrimaryImagesFOP-03.jpg?v=1757581874', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-11.jpg?v=1757581874","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-12.jpg?v=1757581874","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-13.jpg?v=1757581874","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-15.jpg?v=1757581874"]'::jsonb,
  true, false, true, 999, 8, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-plus-water-fortified-with-zinc-zero-sodium-500ml-pack-of-6', 'functional-water', NULL, '[]'::jsonb,
  'Al Ain Plus water Fortified with Zinc & Zero Sodium 500ml Pack of 6', 'Al Ain Plus water Fortified with Zinc & Zero Sodium 500ml Pack of 6', '', '',
  6, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/02-Shrink-Pack-_E.jpg?v=1738235482', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/02-Shrink-Pack-_A.jpg?v=1738235488"]'::jsonb,
  true, false, true, 999, 9, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-water-bambini-1-5l-water-pack-of-6', 'special-offers', 'Special Offers', '[]'::jsonb,
  'Al Ain Water Bambini, 1.5L Water, Pack of 6, Food Preparation Bottled Water, Ready to Use, Formulated Especially for Babies', 'Al Ain Water Bambini, 1.5L Water, Pack of 6, Food Preparation Bottled Water, Ready to Use, Formulated Especially for Babies', '', '',
  26, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Shrink-bambini-6x1.5-Right-cam-eng-new_c8165552-e1e1-49f5-a0a2-21d348270bb6.jpg?v=1738235401', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Shrink-bambini-6x1.5-Right-cam-ara-new_12b02a2b-dcd8-4a87-b421-a4702171623c.jpg?v=1738235410","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07PCLFXBP.MAIN.jpg?v=1738237263","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07PCLFXBP.PT01.jpg?v=1738237268","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07PCLFXBP.PT02.jpg?v=1738237277","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07PCLFXBP.PT03.jpg?v=1738237285"]'::jsonb,
  true, false, true, 999, 10, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  '24x500ml-voss-natural-mineral-water-rpet', 'premium-range', NULL, '[]'::jsonb,
  '24x500ml VOSS Natural Mineral Water RPET', '24x500ml VOSS Natural Mineral Water RPET', '', '',
  115.24, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/61cUXznrHmL._AC_SL1500.jpg?v=1742377568', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/71SLjnJPsWL._AC_SL1500_RPET.jpg?v=1742377568","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/VossRpet.jpg?v=1742377568"]'::jsonb,
  true, false, true, 999, 11, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  '24x375-ml-voss-still-nat-min-wtr-gb', 'premium-range', NULL, '[]'::jsonb,
  '24x375 ml VOSS Still Nat Min Wtr GB', '24x375 ml VOSS Still Nat Min Wtr GB', '', '',
  128, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/61AGZi3p38L._AC_SL1500_Still375_f481185a-d2a7-4ab5-bb0c-3776bb43a2bc.jpg?v=1742378770', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/710ORRBE9XL._AC_SL1500_Still375_b5aac43f-282f-40ac-af86-fd0e40473167.jpg?v=1742378770","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/51ZM40q04eL._AC_SL1500_Still375_6c0b3c70-7d2c-4b09-b19f-5de16916761b.jpg?v=1742378770"]'::jsonb,
  true, false, true, 999, 12, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  '24x375ml-voss-sparkling-nat-min-wtr-gb', 'premium-range', NULL, '[]'::jsonb,
  '24x375ml VOSS Sparkling Nat Min Wtr GB', '24x375ml VOSS Sparkling Nat Min Wtr GB', '', '',
  148, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/715_mmuXCmL._AC_SL1500_Sparkling375.jpg?v=1742376600', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/71A3pYIQF2L._AC_SL1500_Sparkling375.jpg?v=1742376600","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/51ZNSJTbfyL._AC_SL1500_Sparkling375.jpg?v=1742376600"]'::jsonb,
  true, false, true, 999, 13, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-water-20-5-bottles', 'special-offers', 'Special Offers', '[]'::jsonb,
  'Al Ain Water 20 + 5 Bottles', 'Al Ain Water 20 + 5 Bottles', '', '',
  200, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Buy20Get5Bottles_02ef09d0-a31a-460e-be8f-f915fa3a3e0b.jpg?v=1739181164', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Buy20Get5Bottles_45a855a0-ed63-4f16-81d2-9f0f981daff9.jpg?v=1739181164"]'::jsonb,
  true, false, true, 999, 14, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-water-50-20-bottles', 'special-offers', 'Special Offers', '[]'::jsonb,
  'Al Ain Water 50 + 20 Bottles', 'Al Ain Water 50 + 20 Bottles', '', '',
  500, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Buy50Get20Bottles_6ca9b161-19fa-4da3-a41c-a08dc1f073bc.jpg?v=1739181222', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Buy50Get20Bottles_a3286801-0603-439f-9788-694a1bec78d3.jpg?v=1739181223"]'::jsonb,
  true, false, true, 999, 15, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-water-10-2-bottles', 'special-offers', 'Special Offers', '[]'::jsonb,
  'Al Ain Water 10 + 2 Bottles', 'Al Ain Water 10 + 2 Bottles', '', '',
  100, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Buy10Get2Bottles_bfc0f3ec-b679-4b65-945b-432fdf6c1828.jpg?v=1739181245', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Buy10Get2Bottles_e74900ab-cff1-4e4a-9743-406b668fc52b.jpg?v=1739181246"]'::jsonb,
  true, false, true, 999, 16, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-recycled-pet-bottle-500ml-pack-of-12', 'bottled-water', NULL, '[]'::jsonb,
  'Al Ain Recycled PET Bottle 500ml Pack of 12', 'Al Ain Recycled PET Bottle 500ml Pack of 12', '', '',
  12, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B0CW9WS5G2.MAIN.jpg?v=1738310355', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B0CW9WS5G2.PT01.jpg?v=1738310355","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B0CW9WS5G2.PT02.jpg?v=1738310355","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B0CW9WS5G2.PT03.jpg?v=1738310355","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B0CW9WS5G2.PT04.jpg?v=1738310355","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B0CW9WS5G2.PT05.jpg?v=1738310355"]'::jsonb,
  true, false, true, 999, 17, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-plant-based-bottled-drinking-water-480ml-pack-of-12', 'bottled-water', NULL, '[]'::jsonb,
  'Al Ain Plant Based Bottled Drinking Water 480ml Pack of 12', 'Al Ain Plant Based Bottled Drinking Water 480ml Pack of 12', '', '',
  12, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/plant-bottle-en_8a780d91-5ae8-46fe-872b-f6542b76704c.png?v=1739449197', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/plant-bottle-ar_846f5110-6ff4-42f6-8600-57274aa4219b.png?v=1739449197"]'::jsonb,
  true, false, true, 999, 18, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-sparkling-water-glass-bottle-750ml-pack-of-6', 'premium-range', NULL, '[]'::jsonb,
  'Al Ain Sparkling Water Glass Bottle 750ml Pack of 6', 'Al Ain Sparkling Water Glass Bottle 750ml Pack of 6', '', '',
  27.3, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/6x750ml-GB-Sparkling1679385874.jpg?v=1738217532', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07G9HK7TR.MAIN.jpg?v=1738236138","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07G9HK7TR.PT01.jpg?v=1738236141","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07G9HK7TR.PT02.jpg?v=1738236143","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07G9HK7TR.PT03.jpg?v=1738236147","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07G9HK7TR.PT04.jpg?v=1738236151"]'::jsonb,
  true, false, true, 999, 19, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-still-water-glass-bottle-750ml-pack-of-6', 'premium-range', NULL, '[]'::jsonb,
  'Al Ain Still Water Glass Bottle 750ml Pack of 6', 'Al Ain Still Water Glass Bottle 750ml Pack of 6', '', '',
  25, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/6x750ml-GB-Still1679385749.jpg?v=1738217470', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07G9GJDD1.MAIN.jpg?v=1738235768","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07G9GJDD1.PT01.jpg?v=1738235776","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07G9GJDD1.PT02.jpg?v=1738235781","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07G9GJDD1.PT03.jpg?v=1738235790","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07G9GJDD1.PT04.jpg?v=1738235797"]'::jsonb,
  true, false, true, 999, 20, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-sparkling-water-glass-bottle-330ml-pack-of-6', 'premium-range', NULL, '[]'::jsonb,
  'Al Ain Sparkling Water Glass Bottle 330ml Pack of 6', 'Al Ain Sparkling Water Glass Bottle 330ml Pack of 6', '', '',
  14.94, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/6x330ml-GB-Sparkling1679385588.jpg?v=1738217423', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/1_f0cc1244-776a-47c5-96a9-40ae2020b840.jpg?v=1738236110","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/2_04928e96-cf62-4fc3-9be7-eb6ed31d0c98.jpg?v=1738236112","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/3_a9ad1c9d-e267-4dd5-88f9-af186e877cbb.jpg?v=1738236114","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/4_b970643e-0ba5-46f7-93e1-6ce5a27f89ea.jpg?v=1738236118","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/5_39def4b0-4883-45cc-b1ae-6dd117944e53.jpg?v=1738236120"]'::jsonb,
  true, false, true, 999, 21, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-still-water-glass-bottle-330ml-pack-of-6', 'premium-range', NULL, '[]'::jsonb,
  'Al Ain Still Water Glass Bottle 330ml Pack of 6', 'Al Ain Still Water Glass Bottle 330ml Pack of 6', '', '',
  13.75, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/20160706_0523211678959145.jpg?v=1738217380', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/1.jpg?v=1738235665","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/2.jpg?v=1738235668","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/3.jpg?v=1738235720","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/4.jpg?v=1738235729","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/5.jpg?v=1738235736"]'::jsonb,
  true, false, true, 999, 22, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-bottled-drinking-water-200ml-pack-of-24', 'bottled-water', NULL, '[]'::jsonb,
  'Al Ain Bottled Drinking Water 200ml Pack of 24', 'Al Ain Bottled Drinking Water 200ml Pack of 24', '', '',
  15.23, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/24x200ml-Eng1679051358.jpg?v=1738217307', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/24x200ml-Arab1679051391.jpg?v=1738217329"]'::jsonb,
  true, false, true, 999, 23, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-zero-bottled-drinking-water-200ml-pack-of-12', 'functional-water', NULL, '[]'::jsonb,
  'Al Ain Zero Bottled Drinking Water - 200ml Pack of 12', 'Al Ain Zero Bottled Drinking Water - 200ml Pack of 12', '', '',
  8.57, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07P9FJ2NR.MAIN.jpg?v=1738236835', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07P9FJ2NR.PT01.jpg?v=1738236843","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07P9FJ2NR.PT02.jpg?v=1738236851","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07P9FJ2NR.PT03.jpg?v=1738236860","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07P9FJ2NR.PT04.jpg?v=1738236868","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07P9FJ2NR.PT05.jpg?v=1738236876"]'::jsonb,
  true, false, true, 999, 24, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-zero-bottled-drinking-water-330ml-pack-of-12', 'functional-water', NULL, '[]'::jsonb,
  'Al Ain Zero Bottled Drinking Water - 330ml Pack of 12', 'Al Ain Zero Bottled Drinking Water - 330ml Pack of 12', '', '',
  8.57, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NVM2F2.MAIN.jpg?v=1738236899', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NVM2F2.PT01.jpg?v=1738236907","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NVM2F2.PT02.jpg?v=1738236915","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NVM2F2.PT03.jpg?v=1738236923","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NVM2F2.PT04.jpg?v=1738236934","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NVM2F2.PT05.jpg?v=1738236942"]'::jsonb,
  true, false, true, 999, 25, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-zero-bottled-drinking-water-500ml-pack-of-12', 'functional-water', NULL, '[]'::jsonb,
  'Al Ain Zero Bottled Drinking Water - 500ml Pack of 12', 'Al Ain Zero Bottled Drinking Water - 500ml Pack of 12', '', '',
  8.57, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B077QWSVNR.MAIN.jpg?v=1748431660', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B077QWSVNR.PT01.jpg?v=1748431660","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B077QWSVNR.PT02.jpg?v=1748431660","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B077QWSVNR.PT03.jpg?v=1748431660","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B077QWSVNR.PT04.jpg?v=1748431660","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B077QWSVNR.PT05.jpg?v=1748431660"]'::jsonb,
  true, false, true, 999, 26, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-zero-bottled-drinking-water-1-5l-pack-of-6', 'functional-water', NULL, '[]'::jsonb,
  'Al Ain Zero Bottled Drinking Water - 1.5L Pack of 6', 'Al Ain Zero Bottled Drinking Water - 1.5L Pack of 6', '', '',
  8.57, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NZ7NWX.MAIN.jpg?v=1738236757', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NZ7NWX.PT01.jpg?v=1738236764","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NZ7NWX.PT02.jpg?v=1738236776","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NZ7NWX.PT03.jpg?v=1738236785","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NZ7NWX.PT04.jpg?v=1738236809","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NZ7NWX.PT05.jpg?v=1738236819"]'::jsonb,
  true, true, true, 999, 27, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-bottled-drinking-water-330ml-pack-of-24', 'bottled-water', NULL, '[]'::jsonb,
  'Al Ain Bottled Drinking Water - 330ml Pack of 24', 'Al Ain Bottled Drinking Water - 330ml Pack of 24', '', '',
  15.23, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Al-ain-water-Cartons-24x3301594120384.jpg?v=1738216803', '[]'::jsonb,
  true, false, true, 999, 28, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-bottled-drinking-water-500ml-pack-of-24', 'bottled-water', NULL, '[]'::jsonb,
  'Al Ain Bottled Drinking Water - 500ml Pack of 24', 'Al Ain Bottled Drinking Water - 500ml Pack of 24', '', '',
  15.23, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Al-ain-water-Cartons-24x5001594120235.jpg?v=1738216734', '[]'::jsonb,
  true, false, true, 999, 29, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-bottled-drinking-water-1-5l-pack-of-12', 'bottled-water', NULL, '[]'::jsonb,
  'Al Ain Bottled Drinking Water - 1.5L Pack of 12', 'Al Ain Bottled Drinking Water - 1.5L Pack of 12', '', '',
  15.23, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Al-ain-water-Cartons-12x11594119179.jpg?v=1738216641', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Al-ain-water-Cartons-12x11594119207.jpg?v=1738216658"]'::jsonb,
  true, true, true, 999, 30, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'disposable-paper-cup-6oz', 'dispenser-accessories', NULL, '[]'::jsonb,
  'Disposable Paper Cup 6OZ', 'Disposable Paper Cup 6OZ', '', '',
  40, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Foam-Cups-6OZ1736490637.png?v=1738223647', '[]'::jsonb,
  true, false, true, 999, 31, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'matungi', 'dispenser-accessories', NULL, '[]'::jsonb,
  'Matungi', 'Matungi', '', '',
  30, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Al-Ain-Dispenser-WHITEPET1594122963.jpg?v=1738217859', '[]'::jsonb,
  true, false, true, 999, 32, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'cup-holder-transparent', 'dispenser-accessories', NULL, '[]'::jsonb,
  'Cup Holder Transparent', 'Cup Holder Transparent', '', '',
  20, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/dispenser.jpg?v=1738834945', '[]'::jsonb,
  true, false, true, 999, 33, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'voss-natural-mineral-water-pet-850ml-pack-of-12', 'premium-range', NULL, '[]'::jsonb,
  'VOSS Natural Mineral Water PET - 850ml Pack of 12', 'VOSS Natural Mineral Water PET - 850ml Pack of 12', '', '',
  86.67, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/low-res-11619949375.jpg?v=1738217256', '[]'::jsonb,
  true, false, true, 999, 34, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'top-load-electric-hot-cold-water-water-dispenser', 'dispenser-accessories', NULL, '[]'::jsonb,
  'Top Load Electric Hot & Cold Water Water Dispenser', 'Top Load Electric Hot & Cold Water Water Dispenser', '', '',
  400, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/dispenser_78e8d119-3dd3-44a6-9356-3b143dc34036.jpg?v=1741694518', '[]'::jsonb,
  true, true, true, 999, 35, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-zero-bottled-drinking-water-5-gallon', 'subscriptions', NULL, '[]'::jsonb,
  'Al Ain Zero Bottled Drinking Water 5 Gallon', 'Al Ain Zero Bottled Drinking Water 5 Gallon', '', '',
  11, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/5-Gallon_Zero_E1594117157.jpg?v=1738216228', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/5-Gallon_Zero_A1594117188.jpg?v=1738216465"]'::jsonb,
  true, true, true, 999, 36, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-bottled-drinking-water-5-gallon', 'subscriptions', NULL, '["Convenient","BPA Free","Recyclable","Reusable bottle","Essential minerals"]'::jsonb,
  'Al Ain Bottled Drinking Water 5 Gallon', 'Al Ain Bottled Drinking Water 5 Gallon', '', '',
  10, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/5-Gallon_Regular_E1594113158.jpg?v=1738216064', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/5-Gallon_Regular_A1594113191.jpg?v=1738216428"]'::jsonb,
  true, true, true, 999, 37, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
COMMIT;