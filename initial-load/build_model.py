#!/usr/bin/env python3

import os
import shutil
import json
import requests
import lxml.html as lh
from pathlib import Path
from bs4 import BeautifulSoup

class Weapon:
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

mod_extension = '.obj'
mat_extension = '.mtl'
tex_extension = '.PNG'

def get_db_rows():
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '3600',
        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0'
        }
    mhw_db_url = 'https://mhw.poedb.tw/eng/wp_weapon'
    req = requests.get(mhw_db_url, headers)
    doc = lh.fromstring(req.content)
    return doc.xpath('//tr')

db_rows = get_db_rows()
weapons = []
id = 0
for subdir, dirs, files in os.walk(rootdir):
    wp_identifier = str(Path(subdir).relative_to(rootdir)).replace('\\', '/')
    
    #get all aliases and category from table
    aliases = []
    category = None

    for row in db_rows:
        cells = row.getchildren()
        if cells and cells[4].text_content() == wp_identifier:
            aliases.append(cells[2].text_content())
            if not category:
                category = wp_category_mapping.get(cells[0].text_content())

    if aliases:
        #get relative paths for 3d model files
        obj_path = None
        mtl_path = None
        tex_path = None
        for file in files:
            relative_file_path = os.path.join(wp_identifier, file).replace('\\', '/')
            if(file.endswith(mod_extension)):
                obj_path = relative_file_path
            elif(file.endswith(mat_extension)):
                mtl_path = relative_file_path
            elif(file.endswith(tex_extension)):
                tex_path = relative_file_path
        
        id += 1
        weapons.append(Weapon(id, aliases, obj_path, mtl_path, tex_path, category).__dict__)
        print(Weapon(id, aliases, obj_path, mtl_path, tex_path, category).__dict__) 

#save model file
with open('weapons.json', 'w') as output:
    json.dump(weapons, output, indent=4)