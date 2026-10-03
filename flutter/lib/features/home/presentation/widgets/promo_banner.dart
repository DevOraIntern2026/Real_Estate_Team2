import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:real_estate_app/core/theme/assets.dart';

import '../../../../core/theme/app_colors.dart';

class PromoBanner extends StatefulWidget {
  const PromoBanner({super.key});

  @override
  State<PromoBanner> createState() => _PromoBannerState();
}

class _PromoBannerState extends State<PromoBanner> {
  final _controller = PageController();
  int _page = 0;

  static const _slides = [
    (
      seed: 'rent-dream-home-1',
      title: 'RENT',
      highlight: ' YOUR DREAM HOME',
      subtitle: 'Explore, rent & move in right away'
    ),
    (
      seed: 'rent-dream-home-2',
      title: 'BUY',
      highlight: ' YOUR PERFECT PLACE',
      subtitle: 'Browse verified listings near you'
    ),
    (
      seed: 'rent-dream-home-3',
      title: 'LIST',
      highlight: ' YOUR PROPERTY',
      subtitle: 'Reach thousands of buyers & renters'
    ),
  ];

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 160,
          child: PageView.builder(
            controller: _controller,
            onPageChanged: (i) => setState(() => _page = i),
            itemCount: _slides.length,
            itemBuilder: (context, index) {
              final slide = _slides[index];
              return ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.asset(Assets.assetsImagesBanner1, fit: BoxFit.cover),
                    Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          RichText(
                            text: TextSpan(
                              style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white),
                              children: [
                                TextSpan(text: slide.title),
                                TextSpan(
                                    text: slide.highlight,
                                    style: const TextStyle(
                                        fontWeight: FontWeight.w400,
                                        color: AppColors.primary)),
                              ],
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(slide.subtitle,
                              style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w400)),
                          SizedBox(height: 24.h),
                          const Row(
                            children: [
                              Text('Explore More',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w600)),
                              SizedBox(width: 4),
                              Icon(Icons.north_east,
                                  color: Colors.white, size: 24),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 10),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(_slides.length, (index) {
            final isActive = index == _page;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: isActive ? 18 : 6,
              height: 6,
              decoration: BoxDecoration(
                color: isActive ? AppColors.primary : AppColors.border,
                borderRadius: BorderRadius.circular(3),
              ),
            );
          }),
        ),
      ],
    );
  }
}
