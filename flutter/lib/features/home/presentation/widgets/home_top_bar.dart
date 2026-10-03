import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:real_estate_app/core/theme/assets.dart';

import '../../../../core/theme/app_colors.dart';

class HomeTopBar extends StatelessWidget {
  final String city;
  final String country;

  const HomeTopBar({super.key, required this.city, required this.country});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Image.asset(Assets.assetsImagesLogo,
                      width: 110.w, height: 39.h),
                ],
              ),
              const Row(
                children: [
                  Text('Location',
                      style: TextStyle(
                          color: AppColors.textSecondary, fontSize: 16)),
                  Icon(Icons.keyboard_arrow_down,
                      size: 24, color: AppColors.primary),
                ],
              ),
              Row(
                children: [
                  Image.asset(Assets.assetsImagesLocation,
                      width: 24.w, height: 24.h),
                  const SizedBox(width: 4),
                  Text('$city, $country',
                      style: const TextStyle(
                          fontWeight: FontWeight.w600, fontSize: 16)),
                  const Spacer(),
                  _RoundIconButton(
                      imagePath: Assets.assetsImagesNotification, onTap: () {}),
                  const SizedBox(width: 10),
                  _RoundIconButton(
                      imagePath: Assets.assetsImagesChatbot, onTap: () {}),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _RoundIconButton extends StatelessWidget {
  final String imagePath;
  final VoidCallback onTap;
  const _RoundIconButton({required this.imagePath, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      customBorder: const CircleBorder(),
      child: Container(
        width: 50,
        height: 50,
        decoration: const BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.white,
            border: Border.fromBorderSide(BorderSide(color: AppColors.border))),
        child: Center(
            child: SizedBox(
                child: Image.asset((imagePath), width: 24.w, height: 24.h))),
      ),
    );
  }
}
