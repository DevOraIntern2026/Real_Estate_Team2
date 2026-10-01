import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

enum FieldStatus { none, error, success }

class CustomAuthField extends StatelessWidget {
  final String label;
  final String hint;
  final TextEditingController controller;
  final bool isObscured;
  final bool showObscureToggle;
  final VoidCallback? onToggleObscure;
  final FieldStatus status;
  final String? statusText;
  final TextInputType? keyboardType;
  final ValueChanged<String>? onChanged;

  const CustomAuthField({
    super.key,
    required this.label,
    required this.hint,
    required this.controller,
    this.isObscured = false,
    this.showObscureToggle = false,
    this.onToggleObscure,
    this.status = FieldStatus.none,
    this.statusText,
    this.keyboardType,
    this.onChanged,
  });

  Color get _borderColor {
    switch (status) {
      case FieldStatus.error:
        return AppColors.error;
      case FieldStatus.success:
        return AppColors.success;
      case FieldStatus.none:
        return AppColors.border;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          obscureText: isObscured,
          keyboardType: keyboardType,
          onChanged: onChanged,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: AppColors.textSecondary),
            filled: true,
            fillColor: Colors.white,
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            suffixIcon: showObscureToggle
                ? IconButton(
                    icon: Icon(
                      isObscured ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                      color: AppColors.textSecondary,
                    ),
                    onPressed: onToggleObscure,
                  )
                : null,
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(28),
              borderSide: BorderSide(color: _borderColor),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(28),
              borderSide: BorderSide(color: _borderColor, width: 1.4),
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(28),
              borderSide: BorderSide(color: _borderColor),
            ),
          ),
        ),
        if (status != FieldStatus.none && statusText != null) ...[
          const SizedBox(height: 4),
          Text(
            statusText!,
            style: TextStyle(
              fontSize: 12,
              color: status == FieldStatus.error ? AppColors.error : AppColors.success,
            ),
          ),
        ],
      ],
    );
  }
}
