"""
示例Python代码 - 用于测试代码标注系统
这是一个简单的用户管理系统示例
"""

class User:
    """用户类"""
    
    def __init__(self, username, email, age):
        self.username = username
        self.email = email
        self.age = age
        self.is_active = True
    
    def get_info(self):
        """获取用户信息"""
        return {
            'username': self.username,
            'email': self.email,
            'age': self.age,
            'is_active': self.is_active
        }


class UserManager:
    """用户管理器"""
    
    def __init__(self):
        self.users = {}
    
    def add_user(self, username, email, age):
        """
        添加新用户
        
        Args:
            username: 用户名
            email: 邮箱
            age: 年龄
            
        Returns:
            User对象或None
        """
        if username in self.users:
            print(f"用户 {username} 已存在")
            return None
        
        user = User(username, email, age)
        self.users[username] = user
        return user
    
    def get_user(self, username):
        """根据用户名获取用户"""
        return self.users.get(username)
    
    def delete_user(self, username):
        """删除用户"""
        if username in self.users:
            del self.users[username]
            return True
        return False
    
    def list_users(self):
        """列出所有用户"""
        return [user.get_info() for user in self.users.values()]


def validate_email(email):
    """
    验证邮箱格式
    
    Args:
        email: 邮箱地址
        
    Returns:
        bool: 是否有效
    """
    if '@' not in email:
        return False
    
    parts = email.split('@')
    if len(parts) != 2:
        return False
    
    if '.' not in parts[1]:
        return False
    
    return True


def calculate_age_group(age):
    """计算年龄段"""
    if age < 18:
        return "未成年"
    elif age < 30:
        return "青年"
    elif age < 60:
        return "中年"
    else:
        return "老年"


# 使用示例
if __name__ == "__main__":
    manager = UserManager()
    
    # 添加用户
    user1 = manager.add_user("张三", "zhangsan@example.com", 25)
    user2 = manager.add_user("李四", "lisi@example.com", 35)
    user3 = manager.add_user("王五", "wangwu@example.com", 18)
    
    # 列出所有用户
    users = manager.list_users()
    for user in users:
        print(f"用户: {user['username']}, 年龄: {user['age']}, 年龄段: {calculate_age_group(user['age'])}")
    
    # 获取特定用户
    user = manager.get_user("张三")
    if user:
        print(f"找到用户: {user.get_info()}")
    
    # 删除用户
    if manager.delete_user("李四"):
        print("用户李四已删除")
    
    # 验证邮箱
    test_emails = ["test@example.com", "invalid-email", "test@domain"]
    for email in test_emails:
        result = "有效" if validate_email(email) else "无效"
        print(f"邮箱 {email}: {result}")

