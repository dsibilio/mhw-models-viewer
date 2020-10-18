import { Injectable } from '@angular/core';
import models from '../assets/weapons.json';

@Injectable({
  providedIn: 'root'
})
export class ModelsDataService {

  constructor() { }

  getModelsByCategory(category: string) {
    return models.filter(model => model.category === category)
  }

}
