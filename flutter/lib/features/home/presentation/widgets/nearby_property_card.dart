import 'package:flutter/material.dart';
import 'package:real_estate_app/core/theme/assets.dart';

import '../../../../core/theme/app_colors.dart';

class NearbyPropertyCard extends StatelessWidget {
  final String title;
  final String location;
  final String price;
  final double rating;
  final String imageSeed;
  final bool isFavorite;
  final VoidCallback? onToggleFavorite;
  final VoidCallback? onTap;

  const NearbyPropertyCard({
    super.key,
    required this.title,
    required this.location,
    required this.price,
    required this.rating,
    required this.imageSeed,
    this.isFavorite = false,
    this.onToggleFavorite,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: Image.asset(
                Assets.assetsImagesCozy,
                width: 80,
                height: 62,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(title,
                          style: const TextStyle(
                              fontWeight: FontWeight.w600, fontSize: 14)),
                      const Spacer(),
                      GestureDetector(
                        onTap: onToggleFavorite,
                        child: Icon(
                          isFavorite
                              ? Icons.favorite_rounded
                              : Icons.favorite_border_rounded,
                          color:
                              isFavorite ? AppColors.error : AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined,
                          size: 13, color: AppColors.textSecondary),
                      const SizedBox(width: 2),
                      Expanded(
                        child: Text(
                          location,
                          style: const TextStyle(
                              color: AppColors.textSecondary, fontSize: 12),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Text(price,
                          style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                              color: AppColors.primary)),
                      const Spacer(),
                      const Icon(Icons.star_rounded,
                          size: 16, color: Color(0xFFFFB400)),
                      const SizedBox(width: 2),
                      Text('$rating',
                          style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w400,
                              color: AppColors.textSecondary)),
                      const SizedBox(width: 2),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
