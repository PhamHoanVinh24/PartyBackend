/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function (config) {
    // Define changes to default configuration here. For example:
    config.language = 'vi';
    config.extraPlugins = "youtube,html5video,widget,widgetselection,clipboard,lineutils,maximize,tableresize,dropdownmenumanager,menu,pastefromword";
    config.allowedContent = true;
    config.youtube_width = '640';
    config.youtube_height = '480';
    config.youtube_responsive = true;
    config.youtube_related = true;
    config.youtube_older = false;
    config.youtube_privacy = false;
    config.youtube_autoplay = false;
    config.youtube_controls = true;
    config.youtube_disabled_fields = ['txtEmbed', 'chkAutoplay'];
    config.dropdownmenumanager = {
        'DocumentMenu': {
            items: [{
                name: 'Source',
                command: 'source'
            }, {
                name: 'NewPage',
                command: 'newpage'
            }, {
                name: 'Preview',
                command: 'preview'
            }, {
                name: 'Print',
                command: 'print'
            }, {
                name: 'Templates',
                command: 'templates'
            },],
            label: {
                text: 'Document',
                width: 45,
                visible: true //default value
            },
            iconPath: 'newpage', //You can use global icons or absolute path to the icon
            toolbar: 'document', // to specify toolbar group for button
        },
        'ClipboardMenu': {
            items: [
                {
                    name: 'Cut',
                    command: 'cut'
                }, {
                    name: 'Copy',
                    command: 'copy'
                }, {
                    name: 'Paste',
                    command: 'paste'
                }, {
                    name: 'PasteText',
                    command: 'pastetext'
                }, {
                    name: 'PasteFromWord',
                    command: 'pastefromword'
                },],
            label: {
                text: 'Clipboard',
                width: 45,
                visible: true //default value
            },
            iconPath: 'paste', //You can use global icons or absolute path to the icon
            toolbar: 'clipboard', // to specify toolbar group for button
        },
        'FormsMenu': {
            items: [{
                name: 'Form',
                command: 'form'
            }, {
                name: 'Checkbox',
                command: 'checkbox'
            }, {
                name: 'Radio',
                command: 'radio'
            }, {
                name: 'TextField',
                command: 'textfield'
            }, {
                name: 'Textarea',
                command: 'textarea'
            }, {
                name: 'Select',
                command: 'select'
            }, {
                name: 'Button',
                command: 'button'
            }, {
                name: 'ImageButton',
                command: 'imagebutton'
            }, {
                name: 'HiddenField',
                command: 'hiddenfield'
            },],
            label: {
                text: 'Forms',
                width: 45,
                visible: true //default value
            },
            iconPath: 'form', //You can use global icons or absolute path to the icon
            toolbar: 'forms', // to specify toolbar group for button
        },
        'BasicstylesMenu': {
            items: [{
                name: 'Bold',
                command: 'bold'
            }, {
                name: 'Italic',
                command: 'italic'
            }, {
                name: 'Underline',
                command: 'underline'
            }, {
                name: 'Strike',
                command: 'strike'
            }, {
                name: 'Subscript',
                command: 'subscript'
            }, {
                name: 'Superscript',
                command: 'superscript'
            },],
            label: {
                text: 'Basicstyles',
                width: 45,
                visible: true //default value
            },
            iconPath: 'bold', //You can use global icons or absolute path to the icon
            toolbar: 'basicstyles', // to specify toolbar group for button
        },
        'ParagraphMenu': {
            items: [{
                name: 'Outdent',
                command: 'outdent'
            }, {
                name: 'Indent',
                command: 'indent'
            }, {
                name: 'Blockquote',
                command: 'blockquote'
            }, {
                name: 'CreateDiv',
                command: 'creatediv'
            }, {
                name: 'JustifyLeft',
                command: 'justifyleft'
            },
            {
                name: 'JustifyCenter',
                command: 'justifycenter'
            },
            {
                name: 'JustifyRight',
                command: 'justifyright'
            },
            {
                name: 'JustifyBlock',
                command: 'justifyblock'
            },
            {
                name: 'BidiLtr',
                command: 'bidiltr'
            },
            {
                name: 'BidiRtl',
                command: 'bidirtl'
            }, {
                name: 'Language',
                command: 'language'
            },],
            label: {
                text: 'Paragraph',
                width: 45,
                visible: true //default value
            },
            iconPath: 'justifyLeft', //You can use global icons or absolute path to the icon
            toolbar: 'paragraph', // to specify toolbar group for button
        },
        'LinksMenu': {
            items: [{
                name: 'Link',
                command: 'link'
            }, {
                name: 'Unlink',
                command: 'unlink'
            }, {
                name: 'Anchor',
                command: 'anchor'
            },],
            label: {
                text: 'Link',
                width: 45,
                visible: true //default value
            },
            iconPath: 'Link', //You can use global icons or absolute path to the icon
            toolbar: 'link', // to specify toolbar group for button
        },
        'InsertMenu': {
            items: [
                {
                    name: 'Image',
                    command: 'image'
                },
                {
                    name: 'Youtube',
                    command: 'youtube'
                },
                {
                    name: 'HTML5Video',
                    command: 'html5video'
                },
                {
                    name: 'Table',
                    command: 'table'
                }, {
                    name: 'HorizontalRule',
                    command: 'horizontalrule'
                }, {
                    name: 'Smiley',
                    command: 'smiley'
                }, {
                    name: 'SpecialChar',
                    command: 'specialchar'
                }, {
                    name: 'PageBreak',
                    command: 'pagebreak'
                },
            ],
            label: {
                text: 'Insert',
                width: 45,
                visible: true //default value
            },
            iconPath: 'image', //You can use global icons or absolute path to the icon
            toolbar: 'image', // to specify toolbar group for button
        },
    };
    config.toolbar = [
        { name: 'document', items: ['DocumentMenu', 'Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates'] },
        { name: 'clipboard', items: ['ClipboardMenu', 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'] },
        { name: 'editing', items: ['Find', '-', 'SelectAll', '-', 'Scayt'] },
        { name: 'forms', items: ['FormsMenu', 'Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField'] },
        { name: 'basicstyles', items: ['BasicstylesMenu', 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat'] },
        { name: 'paragraph', items: ['ParagraphMenu', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language'] },
        { name: 'links', items: ['LinksMenu', 'Link', 'Unlink', 'Anchor'] },
        '/',
        { name: 'insert', items: ['InsertMenu', 'Image', 'Youtube', 'HTML5Video', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'] },
        { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
        { name: 'colors', items: ['TextColor', 'BGColor'] },
        { name: 'tools', items: ['Maximize', 'ShowBlocks'] },
        { name: 'about', items: ['About'] }


    ];
    config.removePlugins = 'uploadimage,easyimage,iframe';
    config.removeButtons = 'Source,NewPage,Preview,Print,Templates,Paste,PasteText,PasteFromWord,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Bold,Italic,Underline,Strike,Subscript,Superscript,Outdent,Indent,Blockquote,CreateDiv,JustifyLeft,JustifyCenter,JustifyRight,JustifyBlock,BidiLtr,BidiRtl,Link,Anchor,Image,Table,HorizontalRule,Smiley,SpecialChar,PageBreak,Iframe';
};
