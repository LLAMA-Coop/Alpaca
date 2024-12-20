import { withProps } from "@udecode/cn";
import {
  createPlateEditor,
  Plate,
  ParagraphPlugin,
  PlateElement,
  PlateLeaf,
} from "@udecode/plate-common/react";
import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from "@udecode/plate-code-block/react";
import { HorizontalRulePlugin } from "@udecode/plate-horizontal-rule/react";
import { LinkPlugin } from "@udecode/plate-link/react";
import {
  ListPlugin,
  BulletedListPlugin,
  NumberedListPlugin,
  ListItemPlugin,
  TodoListPlugin,
} from "@udecode/plate-list/react";
import { ImagePlugin, MediaEmbedPlugin } from "@udecode/plate-media/react";
import { TogglePlugin } from "@udecode/plate-toggle/react";
import { ColumnPlugin, ColumnItemPlugin } from "@udecode/plate-layout/react";
import { HeadingPlugin } from "@udecode/plate-heading/react";
import { CaptionPlugin } from "@udecode/plate-caption/react";
import {
  TablePlugin,
  TableRowPlugin,
  TableCellPlugin,
  TableCellHeaderPlugin,
} from "@udecode/plate-table/react";
import { DatePlugin } from "@udecode/plate-date/react";
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  CodePlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
} from "@udecode/plate-basic-marks/react";
import {
  FontColorPlugin,
  FontBackgroundColorPlugin,
  FontSizePlugin,
} from "@udecode/plate-font";
import { HighlightPlugin } from "@udecode/plate-highlight/react";
import { KbdPlugin } from "@udecode/plate-kbd/react";
import { AlignPlugin } from "@udecode/plate-alignment";
import { IndentPlugin } from "@udecode/plate-indent/react";
import { IndentListPlugin } from "@udecode/plate-indent-list/react";
import { LineHeightPlugin } from "@udecode/plate-line-height";
import { AutoformatPlugin } from "@udecode/plate-autoformat/react";
import { EmojiPlugin } from "@udecode/plate-emoji/react";
import { ExitBreakPlugin, SoftBreakPlugin } from "@udecode/plate-break/react";
import { NodeIdPlugin } from "@udecode/plate-node-id";
import { ResetNodePlugin } from "@udecode/plate-reset-node/react";
import { DeletePlugin } from "@udecode/plate-select";
import { TabbablePlugin } from "@udecode/plate-tabbable/react";
import { TrailingBlockPlugin } from "@udecode/plate-trailing-block";
import { DocxPlugin } from "@udecode/plate-docx";
import { CsvPlugin } from "@udecode/plate-csv";
import { MarkdownPlugin } from "@udecode/plate-markdown";
import { HEADING_KEYS } from "@udecode/plate-heading";

import { BlockquoteElement } from "@/sc/plate-ui/blockquote-element";
import { CodeBlockElement } from "@/sc/plate-ui/code-block-element";
import { CodeLineElement } from "@/sc/plate-ui/code-line-element";
import { CodeSyntaxLeaf } from "@/sc/plate-ui/code-syntax-leaf";
import { HrElement } from "@/sc/plate-ui/hr-element";
import { ImageElement } from "@/sc/plate-ui/image-element";
import { LinkElement } from "@/sc/plate-ui/link-element";
import { LinkFloatingToolbar } from "@/sc/plate-ui/link-floating-toolbar";
import { ToggleElement } from "@/sc/plate-ui/toggle-element";
import { ColumnGroupElement } from "@/sc/plate-ui/column-group-element";
import { ColumnElement } from "@/sc/plate-ui/column-element";
import { HeadingElement } from "@/sc/plate-ui/heading-element";
import { ListElement } from "@/sc/plate-ui/list-element";
import { MediaEmbedElement } from "@/sc/plate-ui/media-embed-element";
import { ParagraphElement } from "@/sc/plate-ui/paragraph-element";
import { TableElement } from "@/sc/plate-ui/table-element";
import { TableRowElement } from "@/sc/plate-ui/table-row-element";
import {
  TableCellElement,
  TableCellHeaderElement,
} from "@/sc/plate-ui/table-cell-element";
import { TodoListElement } from "@/sc/plate-ui/todo-list-element";
import { DateElement } from "@/sc/plate-ui/date-element";
import { CodeLeaf } from "@/sc/plate-ui/code-leaf";
import { HighlightLeaf } from "@/sc/plate-ui/highlight-leaf";
import { KbdLeaf } from "@/sc/plate-ui/kbd-leaf";
import { Editor } from "@/sc/plate-ui/editor";
import { FixedToolbar } from "@/sc/plate-ui/fixed-toolbar";
import { FixedToolbarButtons } from "@/sc/plate-ui/fixed-toolbar-buttons";
import { FloatingToolbar } from "@/sc/plate-ui/floating-toolbar";
import { FloatingToolbarButtons } from "@/sc/plate-ui/floating-toolbar-buttons";
import { withPlaceholders } from "@/sc/plate-ui/placeholder";
import { EmojiInputElement } from "@/sc/plate-ui/emoji-input-element";
import { TooltipProvider } from "@/sc/plate-ui/tooltip";

const editor = createPlateEditor({
  plugins: [
    // ParagraphPlugin,
    // BlockquotePlugin,
    // CodeBlockPlugin,
    // HorizontalRulePlugin,
    // LinkPlugin.configure({
    //     render: { afterEditable: () => <LinkFloatingToolbar /> },
    // }),
    // ListPlugin,
    // ImagePlugin,
    // TogglePlugin,
    // ColumnPlugin,
    // HeadingPlugin,
    // MediaEmbedPlugin,
    // CaptionPlugin.configure({
    //     options: { plugins: [ImagePlugin, MediaEmbedPlugin] },
    // }),
    // TablePlugin,
    // TodoListPlugin,
    // DatePlugin,
    // BoldPlugin,
    // ItalicPlugin,
    // UnderlinePlugin,
    // StrikethroughPlugin,
    // CodePlugin,
    // SubscriptPlugin,
    // SuperscriptPlugin,
    // FontColorPlugin,
    // FontBackgroundColorPlugin,
    // FontSizePlugin,
    // HighlightPlugin,
    // KbdPlugin,
    // AlignPlugin.configure({
    //     inject: { targetPlugins: ["p", "h1", "h2", "h3"] },
    // }),
    // IndentPlugin.configure({
    //     inject: { targetPlugins: ["p", "h1", "h2", "h3"] },
    // }),
    // IndentListPlugin.configure({
    //     inject: { targetPlugins: ["p", "h1", "h2", "h3"] },
    // }),
    // LineHeightPlugin.configure({
    //     inject: {
    //         nodeProps: {
    //             defaultNodeValue: 1.5,
    //             validNodeValues: [1, 1.2, 1.5, 2, 3],
    //         },
    //         targetPlugins: ["p", "h1", "h2", "h3"],
    //     },
    // }),
    // AutoformatPlugin.configure({
    //     options: {
    //         enableUndoOnDelete: true,
    //         rules: [
    //             // Usage: https://platejs.org/docs/autoformat
    //         ],
    //     },
    // }),
    // EmojiPlugin,
    // ExitBreakPlugin.configure({
    //     options: {
    //         rules: [
    //             {
    //                 hotkey: "mod+enter",
    //             },
    //             {
    //                 before: true,
    //                 hotkey: "mod+shift+enter",
    //             },
    //             {
    //                 hotkey: "enter",
    //                 level: 1,
    //                 query: {
    //                     allow: ["h1", "h2", "h3"],
    //                     end: true,
    //                     start: true,
    //                 },
    //                 relative: true,
    //             },
    //         ],
    //     },
    // }),
    // NodeIdPlugin,
    // ResetNodePlugin.configure({
    //     options: {
    //         rules: [
    //             // Usage: https://platejs.org/docs/reset-node
    //         ],
    //     },
    // }),
    // DeletePlugin,
    // SoftBreakPlugin.configure({
    //     options: {
    //         rules: [
    //             { hotkey: "shift+enter" },
    //             {
    //                 hotkey: "enter",
    //                 query: {
    //                     allow: ["code_block", "blockquote", "td", "th"],
    //                 },
    //             },
    //         ],
    //     },
    // }),
    // TabbablePlugin,
    // TrailingBlockPlugin.configure({
    //     options: { type: "p" },
    // }),
    // DocxPlugin,
    // CsvPlugin,
    // MarkdownPlugin,
  ],
  override: {
    components: withPlaceholders({
      // [BlockquotePlugin.key]: BlockquoteElement,
      // [CodeBlockPlugin.key]: CodeBlockElement,
      // [CodeLinePlugin.key]: CodeLineElement,
      // [CodeSyntaxPlugin.key]: CodeSyntaxLeaf,
      // [HorizontalRulePlugin.key]: HrElement,
      // [ImagePlugin.key]: ImageElement,
      // [LinkPlugin.key]: LinkElement,
      // [TogglePlugin.key]: ToggleElement,
      // [ColumnPlugin.key]: ColumnGroupElement,
      // [ColumnItemPlugin.key]: ColumnElement,
      // [HEADING_KEYS.h1]: withProps(HeadingElement, { variant: "h1" }),
      // [HEADING_KEYS.h2]: withProps(HeadingElement, { variant: "h2" }),
      // [HEADING_KEYS.h3]: withProps(HeadingElement, { variant: "h3" }),
      // [HEADING_KEYS.h4]: withProps(HeadingElement, { variant: "h4" }),
      // [HEADING_KEYS.h5]: withProps(HeadingElement, { variant: "h5" }),
      // [HEADING_KEYS.h6]: withProps(HeadingElement, { variant: "h6" }),
      // [BulletedListPlugin.key]: withProps(ListElement, { variant: "ul" }),
      // [NumberedListPlugin.key]: withProps(ListElement, { variant: "ol" }),
      // [ListItemPlugin.key]: withProps(PlateElement, { as: "li" }),
      // [MediaEmbedPlugin.key]: MediaEmbedElement,
      // [ParagraphPlugin.key]: ParagraphElement,
      // [TablePlugin.key]: TableElement,
      // [TableRowPlugin.key]: TableRowElement,
      // [TableCellPlugin.key]: TableCellElement,
      // [TableCellHeaderPlugin.key]: TableCellHeaderElement,
      // [TodoListPlugin.key]: TodoListElement,
      // [DatePlugin.key]: DateElement,
      // [BoldPlugin.key]: withProps(PlateLeaf, { as: "strong" }),
      // [CodePlugin.key]: CodeLeaf,
      // [HighlightPlugin.key]: HighlightLeaf,
      // [ItalicPlugin.key]: withProps(PlateLeaf, { as: "em" }),
      // [KbdPlugin.key]: KbdLeaf,
      // [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: "s" }),
      // [SubscriptPlugin.key]: withProps(PlateLeaf, { as: "sub" }),
      // [SuperscriptPlugin.key]: withProps(PlateLeaf, { as: "sup" }),
      // [UnderlinePlugin.key]: withProps(PlateLeaf, { as: "u" }),
    }),
  },
  value: [
    {
      id: "1",
      type: "p",
      children: [{ text: "Hello, World!" }],
    },
  ],
});

export function PlateEditor() {
  return (
    <TooltipProvider>
      <Plate editor={editor}>
        <FixedToolbar>
          <FixedToolbarButtons />
        </FixedToolbar>

        <Editor />

        <FloatingToolbar>
          <FloatingToolbarButtons />
        </FloatingToolbar>
      </Plate>
    </TooltipProvider>
  );
}
