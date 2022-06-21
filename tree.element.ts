import { Svg, SVG } from '@svgdotjs/svg.js';
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

interface ITreeNode {
  title: string;
  children: ITreeNode[];
}
const testTreeData: ITreeNode = {
  title: 'Root',
  children: [
    {
      title: 'Child_1',
      children: [
        {
          title: 'child1_1',
          children: [],
        },
        {
          title: 'child1_2',
          children: [],
        },
      ],
    },
    {
      title: 'Child_2',
      children: [
        {
          title: 'child2_1',
          children: [],
        },
        {
          title: 'child2_2',
          children: [],
        },
      ],
    },
  ],
};

@customElement('tree-element')
export class TreeElement extends LitElement {
  private tree: Svg;
  private treeConfig = {
    vLength: 25,
    hLength: 50,
    vPadding: 5,
  };

  constructor() {
    super();
    this.tree = SVG().viewbox(0, 0, 1000, 1000);
    this.tree.on('click', this.onTextclick);
  }

  onTextclick(e) {
    console.log(e);
  }

  parse(node: ITreeNode, isRoot: boolean, vlengthFromParent: number) {
    const group = this.tree.group();
    const text = this.tree.text(node.title);
    text.on('click', this.onTextclick);
    const textBox = text.bbox();
    const textRect = this.tree.rect(textBox.width, textBox.height).fill('#f06');
    textRect.on('click', this.onTextclick);
    group.add(textRect);
    group.add(text);
    let origin = [0, 0];
    if (!isRoot) {
      const polyline = this.tree
        .polyline([
          0,
          0,
          0,
          vlengthFromParent + this.treeConfig.vLength / 2,
          this.treeConfig.hLength,
          vlengthFromParent + this.treeConfig.vLength / 2,
        ])
        .fill('none')
        .stroke({ color: '#f06', width: 1, linecap: 'round' });
      group.add(polyline);
      origin = [
        this.treeConfig.hLength,
        vlengthFromParent + (textBox.height * 1) / 4,
      ];
    }
    text.move(origin[0], origin[1]);
    textRect.move(origin[0], origin[1]);

    const topPolyline: [number, number] = [
      origin[0] + textBox.width / 2,
      origin[1] + textBox.height,
    ];
    let bbox;
    let verticalLength = 0;
    for (let i = 0; i < node.children.length; ++i) {
      if (bbox) {
        verticalLength += bbox.height;
      }
      const rgroup = this.parse(node.children[i], false, verticalLength);
      bbox = rgroup.bbox();
      rgroup.translate(topPolyline[0], topPolyline[1]);
      group.add(rgroup);
      bbox = rgroup.bbox();
    }
    return group;
  }

  generateSVG() {
    this.parse(testTreeData, true, 0);
    return this.tree.svg();
  }

  render() {
    return html`${unsafeSVG(this.generateSVG())}`;
  }
}
