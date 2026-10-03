import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';

class DiscoverCategoryCard extends StatelessWidget {
  final String label;
  final String imageSeed;
  final bool isSelected;
  final VoidCallback? onTap;

  const DiscoverCategoryCard({
    super.key,
    required this.label,
    required this.imageSeed,
    this.isSelected = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: isSelected
              ? Border.all(color: AppColors.primary, width: 2)
              : Border.all(color: AppColors.border, width: 2),
        ),
        width: 128,
        height: 170,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(8),
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Image.asset(imageSeed, fit: BoxFit.cover),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            Center(
              child: Text(label,
                  style: const TextStyle(
                      fontWeight: FontWeight.w400, fontSize: 16)),
            ),
          ],
        ),
      ),
    );
  }
}
