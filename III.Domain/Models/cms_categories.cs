//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("cms_categories")]
    public class cms_categories
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }
        public string name { get; set; }
        public string alias { get; set; }
        public string description { get; set; }
        public int? parent { get; set; }
        public int? extra_fields_group { get; set; }
        public bool? published { get; set; }
        public int? access { get; set; }
        public int? ordering { get; set; }
        public string image { get; set; }
        public string @params { get; set; }
        public bool? trash { get; set; }
        public string plugins { get; set; }
        public string language { get; set; }
        public string template { get; set; }
        public string multiple_language { get; set; }
    }
}

//namespace III.WebApp.Domain.DbContext
//{
//    using System;
//    using System.Collections.Generic;
    
//    public partial class cms_categories
//    {
//        public int id { get; set; }
//        public string name { get; set; }
//        public string alias { get; set; }
//        public string description { get; set; }
//        public Nullable<int> parent { get; set; }
//        public Nullable<int> extra_fields_group { get; set; }
//        public Nullable<bool> published { get; set; }
//        public Nullable<int> access { get; set; }
//        public Nullable<int> ordering { get; set; }
//        public string image { get; set; }
//        public string @params { get; set; }
//        public Nullable<bool> trash { get; set; }
//        public string plugins { get; set; }
//        public string language { get; set; }
//        public Nullable<int> template { get; set; }
//    }
//}
