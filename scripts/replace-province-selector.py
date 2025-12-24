#!/usr/bin/env python3
"""
Script to replace hardcoded province selectors with ProvinceSelector component
"""

import re
import sys

def replace_province_selector_in_file(filepath):
    """Replace province selector implementation with ProvinceSelector component"""

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Step 1: Add ProvinceSelector import if not present
    if 'import ProvinceSelector' not in content:
        # Find the last import statement
        import_pattern = r"(import.*from\s+['\"]\.\.\/.*?['\"];?\n)"
        imports = list(re.finditer(import_pattern, content))
        if imports:
            last_import = imports[-1]
            insert_pos = last_import.end()
            import_statement = "import ProvinceSelector from '../../../components/ProvinceSelector';\n"
            content = content[:insert_pos] + import_statement + content[insert_pos:]

    # Step 2: Remove Modal and Pressable from imports if they're only used for province modal
    content = re.sub(r',?\s*Modal\s*,?', ',', content)
    content = re.sub(r',?\s*Pressable\s*,?', ',', content)
    # Clean up double commas
    content = re.sub(r',\s*,', ',', content)
    content = re.sub(r'{\s*,', '{', content)
    content = re.sub(r',\s*}', '}', content)

    # Step 3: Remove Province interface if present
    content = re.sub(r'interface Province \{[^}]+\}\n*', '', content)

    # Step 4: Remove hardcoded province list
    # Pattern: const provinces: Province[] = [...];
    content = re.sub(
        r'const provinces:\s*Province\[\]\s*=\s*\[[^\]]+\];?\n*',
        '',
        content,
        flags=re.DOTALL
    )

    # Pattern: const PROVINCES = [...];
    content = re.sub(
        r'const PROVINCES\s*=\s*\[[^\]]+\];?\n*',
        '',
        content,
        flags=re.DOTALL
    )

    # Step 5: Remove province-related state
    content = re.sub(r'const \[showProvinceModal,\s*setShowProvinceModal\]\s*=\s*useState.*?;?\n', '', content)
    content = re.sub(r'const \[provinceSearchKeyword,\s*setProvinceSearchKeyword\]\s*=\s*useState.*?;?\n', '', content)

    # Step 6: Remove filteredProvinces
    content = re.sub(r'const filteredProvinces\s*=\s*provinces\.filter.*?;?\n', '', content)

    # Step 7: Remove Province Selection Modal
    # This is complex, need to find the modal block
    modal_pattern = r'<Modal[^>]*visible=\{showProvinceModal\}.*?<\/Modal>'
    content = re.sub(modal_pattern, '', content, flags=re.DOTALL)

    # Alternative: Remove by comment marker
    content = re.sub(
        r'\/\* Province Selection Modal \*\/.*?<\/Modal>',
        '',
        content,
        flags=re.DOTALL
    )

    # Step 8: For simple cases without react-hook-form
    # Replace TouchableOpacity province selector with ProvinceSelector
    # This is screen-specific and may need manual adjustment

    print(f"Processed: {filepath}")
    print(f"Changes made: {len(original_content) != len(content)}")

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    return content != original_content

if __name__ == '__main__':
    files = [
        'src/screens/main/ProfileScreen/EditProfileScreen.tsx',
        'src/screens/main/DistributionSystemScreen/DistributionSystemScreen.tsx',
        'src/screens/auth/SignupScreen/DealerSignupScreen.tsx',
        'src/screens/main/WarrantyReportScreen/WarrantyReportScreen.tsx',
    ]

    for filepath in files:
        try:
            changed = replace_province_selector_in_file(filepath)
            if changed:
                print(f"✓ Updated: {filepath}")
            else:
                print(f"- No changes: {filepath}")
        except Exception as e:
            print(f"✗ Error processing {filepath}: {e}")
            sys.exit(1)
