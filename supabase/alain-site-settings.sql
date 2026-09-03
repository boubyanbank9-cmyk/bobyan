-- Al Ain Water site_settings branding (run after schema.sql)
UPDATE site_settings SET
  brand_name = 'Al Ain Water',
  brand_name_ar = 'مياه العين',
  brand_subtitle = 'UAE''s Leading Water Brand',
  brand_subtitle_ar = 'العلامة الرائدة للمياه في الإمارات',
  phone = '80025246',
  whatsapp = '+97180025246',
  email = 'help@alainwater.com',
  address = 'Sky Tower, 17th Floor, Al Reem Island, Abu Dhabi, UAE',
  address_ar = 'برج سكاي، الطابق ١٧، جزيرة الريم، أبوظبي، الإمارات',
  hours = 'Sat - Thu: 9:00 - 21:00',
  hours_ar = 'السبت - الخميس: ٩:٠٠ - ٢١:٠٠',
  social_instagram = 'https://www.instagram.com/alainwaterofficial',
  social_facebook = 'https://www.facebook.com/alainwater',
  logo_url = 'https://alainwater.com/cdn/shop/files/Logo_Small_8efe5185-9bae-4d27-9986-a7c64b62bf21.png?v=1712162622',
  updated_at = NOW()
WHERE id = 1;
