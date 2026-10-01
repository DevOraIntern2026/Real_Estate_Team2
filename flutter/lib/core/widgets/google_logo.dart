import 'package:flutter/material.dart';

/// Small 4-color "G" mark used on the Google sign-in button.
/// Drawn in code (no image asset) so the widget stays self-contained.
class GoogleLogo extends StatelessWidget {
  final double size;
  const GoogleLogo({super.key, this.size = 20});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: _GoogleGPainter()),
    );
  }
}

class _GoogleGPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final rect = Rect.fromLTWH(0, 0, size.width, size.height);
    final strokeWidth = size.width * 0.2;
    final radius = (size.width - strokeWidth) / 2;
    final center = Offset(size.width / 2, size.height / 2);

    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.butt;

    void arc(double startDeg, double sweepDeg, Color color) {
      paint.color = color;
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startDeg * 3.1415926535 / 180,
        sweepDeg * 3.1415926535 / 180,
        false,
        paint,
      );
    }

    arc(-10, 100, const Color(0xFF4285F4));
    arc(90, 80, const Color(0xFF34A853));
    arc(170, 70, const Color(0xFFFBBC05));
    arc(240, 110, const Color(0xFFEA4335));

    final barPaint = Paint()..color = const Color(0xFF4285F4);
    canvas.drawRect(
      Rect.fromLTWH(center.dx, center.dy - strokeWidth / 2, radius * 0.85, strokeWidth),
      barPaint,
    );
    canvas.save();
    canvas.restore();
    canvas.clipRect(rect);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
