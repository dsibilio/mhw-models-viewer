import { Injectable } from '@angular/core';
import models from '../assets/weapons.json';

@Injectable({
  providedIn: 'root'
})
export class ModelsDataService {

  modelsByAlias = new Map<string, any>()
  aliasesByCategory = new Map<string, string[]>()
  aliases = []

  constructor() { 
    models.forEach(model =>
      model.aliases.forEach(alias => {
        this.modelsByAlias.set(alias, model)
        this.aliases.push(alias)

        let currentAliases = this.aliasesByCategory.get(model.category)
        if(currentAliases === undefined) {
          currentAliases = [ alias ]
          this.aliasesByCategory.set(model.category, currentAliases)
        } else {
          currentAliases.push(alias)
        }
      })
    )
  }

  getModels() {
    return models    
  }

  getMatchingAliases(aliasFilter: string): string[] {
    if(aliasFilter != undefined) {
      aliasFilter = aliasFilter.toLowerCase()

      if(aliasFilter.length > 2)
        return this.aliases.filter(alias => alias.toLowerCase().indexOf(aliasFilter) != -1)
    }

    return []
  }

  getModelByAlias(alias: string) {
    return this.modelsByAlias.get(alias)
  }

  getAliasesByCategory(category: string): string[] {
    let result = this.aliasesByCategory.get(category);
    return result != undefined ? result.slice() : []
  }

}
