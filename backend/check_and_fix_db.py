"""
数据库检查和修复工具
"""
import sys
import os

# 添加父目录到路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import inspect, text
from app.database import engine, init_db
from app.models.annotation import AnnotationType
from app.database import SessionLocal


def check_database():
    """检查数据库状态"""
    print("=" * 50)
    print("数据库诊断工具")
    print("=" * 50)
    print()
    
    # 检查数据库文件
    db_file = "database.db"
    if os.path.exists(db_file):
        print(f"✓ 数据库文件存在: {db_file}")
        size = os.path.getsize(db_file)
        print(f"  文件大小: {size} 字节")
    else:
        print(f"✗ 数据库文件不存在: {db_file}")
        print("  将创建新数据库...")
        init_db()
        print("✓ 数据库已创建")
        return
    
    print()
    
    # 检查表结构
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"数据库中的表 ({len(tables)}): {', '.join(tables)}")
    print()
    
    # 检查 annotation_types 表
    if "annotation_types" in tables:
        print("✓ annotation_types 表存在")
        
        # 获取列信息
        columns = inspector.get_columns("annotation_types")
        print(f"  列: {', '.join([col['name'] for col in columns])}")
        
        # 检查数据
        db = SessionLocal()
        try:
            types = db.query(AnnotationType).all()
            print(f"  记录数: {len(types)}")
            
            if len(types) == 0:
                print("  ⚠️  没有标注类型数据，将初始化默认类型...")
                init_default_types(db)
            else:
                print("  标注类型列表:")
                for t in types:
                    print(f"    - {t.name} (优先级: {t.priority}, 颜色: {t.color})")
        except Exception as e:
            print(f"  ✗ 查询失败: {e}")
            print("  尝试修复...")
            fix_annotation_types_table()
        finally:
            db.close()
    else:
        print("✗ annotation_types 表不存在")
        print("  重建数据库表...")
        init_db()
        print("✓ 数据库表已创建")
        
        # 初始化默认数据
        db = SessionLocal()
        try:
            init_default_types(db)
        finally:
            db.close()
    
    print()
    print("=" * 50)
    print("诊断完成")
    print("=" * 50)


def init_default_types(db):
    """初始化默认标注类型"""
    default_types = [
        {
            "name": "info",
            "color": "#1890ff",
            "icon": "InfoCircle",
            "priority": 1
        },
        {
            "name": "warning",
            "color": "#faad14",
            "icon": "Warning",
            "priority": 3
        },
        {
            "name": "suggestion",
            "color": "#52c41a",
            "icon": "Bulb",
            "priority": 2
        },
        {
            "name": "security",
            "color": "#f5222d",
            "icon": "Lock",
            "priority": 4
        }
    ]
    
    created_count = 0
    for type_data in default_types:
        existing = db.query(AnnotationType).filter(AnnotationType.name == type_data['name']).first()
        if not existing:
            db_type = AnnotationType(**type_data)
            db.add(db_type)
            created_count += 1
    
    db.commit()
    print(f"✓ 已初始化 {created_count} 个默认标注类型")


def fix_annotation_types_table():
    """修复 annotation_types 表"""
    print("重建 annotation_types 表...")
    
    db = SessionLocal()
    try:
        # 删除旧表
        db.execute(text("DROP TABLE IF EXISTS annotation_types"))
        db.commit()
        
        # 重建表
        init_db()
        
        # 初始化默认数据
        init_default_types(db)
        
        print("✓ annotation_types 表已修复")
    except Exception as e:
        print(f"✗ 修复失败: {e}")
        db.rollback()
    finally:
        db.close()


def test_api():
    """测试API查询"""
    print()
    print("测试API查询...")
    
    db = SessionLocal()
    try:
        types = db.query(AnnotationType).order_by(AnnotationType.priority.desc()).all()
        print(f"✓ 查询成功，返回 {len(types)} 条记录")
        
        for t in types:
            print(f"  - ID: {t.id}, Name: {t.name}, Color: {t.color}, Priority: {t.priority}")
    except Exception as e:
        print(f"✗ 查询失败: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    try:
        check_database()
        test_api()
    except Exception as e:
        print(f"\n错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

