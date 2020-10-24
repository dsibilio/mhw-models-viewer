import { Component, HostListener, ViewChild } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { categories } from './categories';
import { ModelsDataService } from '../models-data.service';

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';

/** File node data with possible child nodes. */
export interface FileNode {
  [x: string]: any;
  name: string;
  type: string;
  children?: FileNode[];
}

/**
 * Flattened tree node that has been created from a FileNode through the flattener. Flattened
 * nodes include level index and whether they can be expanded or not.
 */
export interface FlatTreeNode {
  name: string;
  type: string;
  level: number;
  expandable: boolean;
}

@Component({
  selector: 'app-model-viewer',
  templateUrl: './model-viewer.component.html',
  styleUrls: ['./model-viewer.component.css']
})
export class ModelViewerComponent {

  /** The TreeControl controls the expand/collapse state of tree nodes.  */
  treeControl: FlatTreeControl<FlatTreeNode>;
  /** The TreeFlattener is used to generate the flat list of items from hierarchical data. */
  treeFlattener: MatTreeFlattener<FileNode, FlatTreeNode>;
  /** The MatTreeFlatDataSource connects the control and flattener to provide data. */
  dataSource: MatTreeFlatDataSource<FileNode, FlatTreeNode>;

  aliasesByCategory: string[];
  selectedAlias: string;
  selectedCategory: string;
  selectedModel;

  backgroundColor = '#e6e9ed';
  reloading;

  filterFormControl = new FormControl();
  filteredOptions: Observable<any>;
  filterSubmitted: boolean;

  @ViewChild('filterAutocomplete', {static: true}) autocomplete: MatAutocomplete;

  constructor(
    private modelsDataService: ModelsDataService
  ) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren);

    this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSource.data = categories;
  }

  ngOnInit() {
    this.filterFormControl.setValidators(
      control => {
        if (this.modelsDataService.getModelByAlias(control.value) != undefined)
          return null;

        return { 'filterFormControl': 'Selected model does not exist' };
      }
    );

    this.filteredOptions = this.filterFormControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  private _filter(value: string): string[] {
    return this.modelsDataService.getMatchingAliases(value);
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.aliasesByCategory = this.modelsDataService.getAliasesByCategory(this.selectedCategory).sort();
    this.shiftSelectedElementToTop(this.selectedAlias);
  }

  shiftSelectedElementToTop(alias: string) {
    if(alias != undefined) {
      const index = this.aliasesByCategory.indexOf(alias);
      this.aliasesByCategory.unshift(this.aliasesByCategory[index]);
      this.aliasesByCategory.splice(index + 1, 1);
    }
  }

  onFilterSubmit() {
    this.selectModelOnFilter(this.filterFormControl.value);
  }

  selectModelOnFilter(alias: string) {
    this.filterSubmitted = true;
    this.selectModelByAlias(alias);
    this.treeControl.expandAll();
  }

  resetFilterForm() {
    if(this.filterFormControl.errors && !this.autocomplete.isOpen) {
      this.filterSubmitted = false;
      this.filterFormControl.reset();
      this.filterFormControl.setErrors(null);
    }
  }

  selectModelByAlias(alias: string) {
    if(this.selectedModel != undefined) {
      this.aliasesByCategory.shift();
    }

    this.selectedAlias = alias;
    this.selectedModel = this.modelsDataService.getModelByAlias(alias);
    this.selectCategory(this.selectedModel.category);
    this.shiftSelectedElementToTop(alias);
    this.reloadCanvas();
  }

  reloadCanvas() {
    this.reloading = true;
    setTimeout(function () { 
      window.dispatchEvent(new Event("reloadCanvas"));
     }, 0);
  }

  @HostListener('window:reloadComplete',['$event'])
  onReloadComplete(event) {
    this.reloading = false;
  }

  isReloading() {
    return this.reloading;
  }

  /** Transform the data to something the tree can read. */
  transformer(node: FileNode, level: number) {
    return {
      name: node.name,
      type: node.type,
      id: node.id,
      level: level,
      expandable: !!node.children
    };
  }

  /** Get the level of the node */
  getLevel(node: FlatTreeNode) {
    return node.level;
  }

  /** Get whether the node is expanded or not. */
  isExpandable(node: FlatTreeNode) {
    return node.expandable;
  }

  /** Get whether the node has children or not. */
  hasChild(index: number, node: FlatTreeNode) {
    return node.expandable;
  }

  /** Get the children for the node. */
  getChildren(node: FileNode): FileNode[] | null | undefined {
    return node.children;
  }

}
