import '../../domain/entities/user_entity.dart';

class UserModel extends UserEntity {
  const UserModel({
    required super.id,
    required super.name,
    required super.email,
    required super.role,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'].toString(),
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: _roleFromString(json['role']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role.name,
    };
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
