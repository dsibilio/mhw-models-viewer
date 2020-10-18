#!/usr/bin/env python3

import os
import shutil
from pathlib import Path
import bpy
import addon_utils


rootdir = r'D:\UnchunkedMHW\chunk\wp'
rootdir_parent = os.path.split(rootdir)[0]
output_rootdir = r'D:\OutputMHW'
excluded_dirs = ['common', 'emblem', 'epv', 'mot', 'parts', 'sound']
texture_suffix = '_BML.PNG'

def prepare_output_path(subdir):
    subdir_parent = os.path.split(subdir)[0]
    output_subdir = str(Path(subdir_parent).relative_to(rootdir_parent))
    output_path = os.path.join(output_rootdir, output_subdir)
    os.makedirs(output_path, exist_ok=True)
    return output_path

addon_utils.enable(module_name="Mod3-MHW-Importer")

for subdir, dirs, files in os.walk(rootdir):
    if not any(exclusion in subdir for exclusion in excluded_dirs):
        for file in files:
            if file.replace('.mod3', '') in subdir:
                output_path = prepare_output_path(subdir)

                #import mod3 file + materials
                import_file_path = os.path.join(subdir, file)
                bpy.ops.custom_import.import_mhw_mod3(filepath=import_file_path, import_materials=True)
               
                #export mod3 file as obj + mtl
                output_file_path = os.path.join(output_path, file.replace('.mod3', '.obj'))
                bpy.ops.export_scene.obj(filepath=output_file_path, check_existing=False)

                #export texture as png
                texture_file_path = import_file_path.replace('.mod3', texture_suffix)
                out_texture_file_path = output_file_path.replace('.obj', texture_suffix)
                try:
                    shutil.copyfile(texture_file_path, out_texture_file_path)
                except FileNotFoundError:
                    with open('missing_textures.log', 'a') as missing_textures:
                        missing_textures.write(texture_file_path + '\n')