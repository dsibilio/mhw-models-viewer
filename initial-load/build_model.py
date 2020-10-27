#!/usr/bin/env python3

import json
import os
import shutil
from collections import defaultdict
from pathlib import Path

import lxml.html as lh
import requests


class Model:
    def __init__(self, id, aliases, obj_path, mtl_path, tex_path, category):
        self.id = id
        self.aliases = aliases
        self.obj_path = obj_path
        self.mtl_path = mtl_path
        self.tex_path = tex_path
        self.category = category

rootdir = r'D:\OutputMHW'

wp_category_mapping = { 'bow' : 'Bow', 'c_axe' : 'Charge Blade', 'g_lance' : 'Gun Lance', 'hammer' : 'Hammer',
 'hbg' : 'Heavy Bowgun', 'lance' : 'Lance', 'l_sword' : 'Great Sword', 'lbg' : 'Light Bowgun',
  'rod' : 'Insect Glaive', 's_axe' : 'Switch Axe', 'sword' : 'Sword and Shield', 
  'tachi' : 'Long Sword', 'whistle' : 'Hunting Horn', 'w_sword' : 'Dual Blades' }

aliases_by_category = defaultdict(list)

mod_extension = '.obj'
mat_extension = '.mtl'
tex_extension = '.PNG'

def get_db_rows(db_suffix):
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '3600',
        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0'
        }
    mhw_db_url = 'https://mhw.poedb.tw/eng/' + db_suffix
    req = requests.get(mhw_db_url, headers)
    doc = lh.fromstring(req.content)
    return doc.xpath('//tr')

wp_db_rows = get_db_rows('wp_weapon')
em_db_rows = get_db_rows('em')

models = []
id = 0
for subdir, dirs, files in os.walk(rootdir):
    model_identifier = str(Path(subdir).relative_to(rootdir)).replace('\\', '/')
    
    #get all aliases and category from table
    aliases = []
    category = None

    if model_identifier.startswith('wp'):
        for row in wp_db_rows:
            cells = row.getchildren()
            if cells and cells[4].text_content() == model_identifier:
                aliases.append(cells[2].text_content())
                if not category:
                    category = wp_category_mapping.get(cells[0].text_content())
    elif model_identifier.startswith('em'):
        category = 'Monster'
        for row in em_db_rows:
            cells = row.getchildren()
            if cells and cells[0].text_content().replace(' ', '/') in model_identifier:
                aliases.append(cells[1].text_content())

    if aliases:
        #remove duplicates from aliases
        aliases = list(dict.fromkeys(aliases))

        #check that current model is not already mapped
        is_duplicate = False
        previous_aliases = aliases_by_category[category]
        for previous_alias in previous_aliases:
            if all(elem in previous_alias for elem in aliases):
                is_duplicate = True
                break

        if not is_duplicate:
            #get relative paths for 3d model files
            obj_path = None
            mtl_path = None
            tex_path = None
            for file in files:
                relative_file_path = os.path.join(model_identifier, file).replace('\\', '/')
                if(file.endswith(mod_extension)):
                    obj_path = relative_file_path
                elif(file.endswith(mat_extension)):
                    mtl_path = relative_file_path
                elif(file.endswith(tex_extension)):
                    tex_path = relative_file_path
            
            id += 1
            models.append(Model(id, aliases, obj_path, mtl_path, tex_path, category).__dict__)
            print(Model(id, aliases, obj_path, mtl_path, tex_path, category).__dict__)

            #add aliases to previously encountered aliases
            aliases_by_category[category].append(aliases)
            #prepare file bundle for assets
            shutil.copytree(subdir, model_identifier)

#save model file
with open('models.json', 'w') as output:
    json.dump(models, output, indent=4)
