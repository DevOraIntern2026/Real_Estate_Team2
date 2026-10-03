import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:real_estate_app/core/theme/assets.dart';

import '../../../../core/theme/app_colors.dart';

class HomeSearchBar extends StatelessWidget {
  final VoidCallback? onTapFilter;
  final ValueChanged<String>? onChanged;

  const HomeSearchBar({super.key, this.onTapFilter, this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                Image.asset(Assets.assetsImagesSearch,
                    width: 24.w, height: 24.h),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    onChanged: onChanged,
                    decoration: const InputDecoration(
                      hintText: 'Search',
                      hintStyle: TextStyle(color: AppColors.textSecondary),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: EdgeInsets.symmetric(vertical: 14),
                    ),
                  ),
                ),
                InkWell(
                  onTap: onTapFilter,
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    child: Image.asset(Assets.assetsImagesSort,
                        width: 24.w, height: 24.h),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
