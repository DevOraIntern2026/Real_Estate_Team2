import '../../domain/entities/user_entity.dart';

class UserModel extends UserEntity {
  const UserModel({
    required super.id,
    required super.email,
    required super.role,
    required super.isEmailVerified,
  });

  factory UserModel.fromJwtClaims(Map<String, dynamic> claims) {
    final sub = claims['sub'];
    final source = sub is Map<String, dynamic> ? sub : claims;
    return UserModel(
      id: (source['_id'] ?? source['id'] ?? '').toString(),
      email: (source['email'] ?? '').toString(),
      role: _roleFromString(source['role']?.toString()),
      isEmailVerified: source['isEmailVerified'] == true,
    );
  }

  static UserRole _roleFromString(String? value) {
    switch (value) {
      case 'owner':
        return UserRole.owner;
      case 'agent':
        return UserRole.agent;
      case 'admin':
        return UserRole.admin;
      default:
        return UserRole.customer;
    }
  }
}
