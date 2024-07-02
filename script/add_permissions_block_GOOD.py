import os
from ruamel.yaml import YAML
from glob import glob
from fnmatch import fnmatch

def add_permissions_block(file_path):
    with open(file_path, 'r') as f:
        yaml = YAML()
        content = yaml.load(f)

    # Check if 'on' block exists and if 'permissions' block is not present in jobs
    if 'on' in content and ('jobs' not in content or 'permissions' not in content['jobs']):
        # Add a blank line and insert 'permissions' block after 'on' block
        content['permissions'] = 'write-all'

    # Insert a blank line after 'on' block
        insert_blank_line(content, 'permissions', 'on', yaml)

        with open(file_path, 'w') as f:
            yaml.dump(content, f)

def insert_blank_line(data, key, anchor, yaml):
    if anchor in data and key in data:
        index = list(data.keys()).index(anchor) + 1
        # Insert a blank line after 'on' block
        if key in data.ca.items:
            indent = data.ca.items[key][0].start_mark.column
            data.yaml_set_comment_before_after_key(key, before='\n', indent=indent)
        data.insert(index, key, data[key])



def process_workflow_files():
    # Get a list of all .yml files in the .github/workflows directory
    workflow_files = glob('.github/workflows/*.yml')

    # Patterns for files to be excluded
    exclude_patterns = ['token-permission.yml', 'add-license-file.yml']

    for file_path in workflow_files:
        # Extracting only the file name from the full path
        file_name = os.path.basename(file_path)
        
        # Check if the file should be excluded
        if any(fnmatch(file_name, pattern) for pattern in exclude_patterns):
            print(f"Skipping {file_path}")
            continue

        add_permissions_block(file_path)

if __name__ == "__main__":
    process_workflow_files()
