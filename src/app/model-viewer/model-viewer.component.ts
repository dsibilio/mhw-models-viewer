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

  selectedAlias: string;
  selectedCategory: string;
  selectedModel;

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
  }

  onFilterSubmit() {
    this.filterSubmitted = true;
    this.selectModelByAlias(this.filterFormControl.value);
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
    this.selectedAlias = alias;
    this.selectedModel = this.modelsDataService.getModelByAlias(alias);
    this.selectedCategory = this.selectedModel.category;
  }

  getAliasesByCategory(category: string): string[] {
    return this.modelsDataService.getAliasesByCategory(category).sort();
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
