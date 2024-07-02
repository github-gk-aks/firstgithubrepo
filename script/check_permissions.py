import os
import sys
from ruamel.yaml import YAML
from glob import glob
from fnmatch import fnmatch

def check_permissions_block(file_path):
    with open(file_path, 'r') as f:
        yaml = YAML()
        content = yaml.load(f)

    permissions_found = 'N'

    if 'permissions' in content:
        print(f"Permissions block found at the top level in {file_path}")
        permissions_found = 'Y'
    else:
        print(f"Permission block not found at top level")

    if 'jobs' in content:
        for job_name, job_content in content['jobs'].items():
            if 'permissions' in job_content:
                print(f"Permissions block found in job '{job_name}' in {file_path}")
                permissions_found = 'Y'
            else:
                print(f"Permissions block not found in job '{job_name}' in {file_path}")

    return permissions_found
    
if __name__ == "__main__":
    file_path = sys.argv[1]
    permissions_found = check_permissions_block(file_path)
    if permissions_found == 'N':
        print(f"Permissions block not found in {file_path}")
        print("::set-output name=permissions_found::false")
    else:
        print("::set-output name=permissions_found::true")

