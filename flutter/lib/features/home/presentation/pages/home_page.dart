import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:real_estate_app/core/theme/assets.dart';

import '../widgets/discover_category_card.dart';
import '../widgets/home_search_bar.dart';
import '../widgets/home_top_bar.dart';
import '../widgets/nearby_property_card.dart';
import '../widgets/promo_banner.dart';
import '../widgets/section_header.dart';
import '../widgets/top_city_item.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedCategory = 1;
  int _selectedCity = 0;
  final Set<int> _favoriteIds = {0};

  static const _categories = [
    (
      label: 'Apartments',
      imageSeed: Assets.assetsImagesApartments,
      thumbSeed: 'apartments'
    ),
    (label: 'Villa', imageSeed: Assets.assetsImagesVilla, thumbSeed: 'villa'),
    (
      label: 'Studio',
      imageSeed: Assets.assetsImagesApartments,
      thumbSeed: 'studio'
    ),
  ];

  static const _cities = [
    (name: 'New Cairo', imageSeed: Assets.assetsImagesCity1),
    (name: 'Ain Sokhna', imageSeed: Assets.assetsImagesCity2),
    (name: 'Hurghada', imageSeed: Assets.assetsImagesCity3),
    (name: 'Alexandria', imageSeed: Assets.assetsImagesCity1),
  ];

  static const _nearbyListings = [
    (
      title: 'Cozy Apartment',
      location: 'New Cairo, Egypt',
      price: 'EGP 25,000/month',
      rating: 4.8,
      imageSeed: 'nearby-1'
    ),
    (
      title: 'Cozy Apartment',
      location: 'New Cairo, Egypt',
      price: 'EGP 25,000/month',
      rating: 4.8,
      imageSeed: 'nearby-2'
    ),
    (
      title: 'Cozy Apartment',
      location: 'New Cairo, Egypt',
      price: 'EGP 25,000/month',
      rating: 4.8,
      imageSeed: 'nearby-3'
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        children: [
          const HomeTopBar(city: 'Cairo', country: 'Egypt'),
          const SizedBox(height: 18),
          const HomeSearchBar(),
          const SizedBox(height: 20),
          const PromoBanner(),
          const SizedBox(height: 24),
          SectionHeader(title: 'Discover Properties', onAction: () {}),
          const SizedBox(height: 12),
          SizedBox(
            height: 140.h,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 14),
              itemBuilder: (context, index) {
                final c = _categories[index];
                return DiscoverCategoryCard(
                  label: c.label,
                  imageSeed: c.imageSeed,
                  isSelected: _selectedCategory == index,
                  onTap: () => setState(() => _selectedCategory = index),
                );
              },
            ),
          ),
          const SizedBox(height: 24),
          SectionHeader(
              title: 'Top Cities', actionLabel: 'See More', onAction: () {}),
          const SizedBox(height: 12),
          SizedBox(
            height: 48.h,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _cities.length,
              separatorBuilder: (_, __) => const SizedBox(width: 16),
              itemBuilder: (context, index) {
                final c = _cities[index];
                return TopCityItem(
                  name: c.name,
                  imageSeed: c.imageSeed,
                  isSelected: _selectedCity == index,
                  onTap: () => setState(() => _selectedCity = index),
                );
              },
            ),
          ),
          const SizedBox(height: 24),
          SectionHeader(title: 'Nearby', onAction: () {}),
          const SizedBox(height: 12),
          ...List.generate(_nearbyListings.length, (index) {
            final item = _nearbyListings[index];
            return NearbyPropertyCard(
              title: item.title,
              location: item.location,
              price: item.price,
              rating: item.rating,
              imageSeed: item.imageSeed,
              isFavorite: _favoriteIds.contains(index),
              onToggleFavorite: () => setState(() {
                if (_favoriteIds.contains(index)) {
                  _favoriteIds.remove(index);
                } else {
                  _favoriteIds.add(index);
                }
              }),
              onTap: () {
                // TODO: navigate to property details once Flutter 2 builds that screen
              },
            );
          }),
        ],
      ),
    );
  }
}
