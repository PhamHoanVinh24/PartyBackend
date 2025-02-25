//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;


namespace ESEIM.Models
{
    [Table("cms_items")]
    public class cms_items
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        [StringLength(255)]
        public string title { get; set; }

        [StringLength(255)]
        public string alias { get; set; }

        public int? cat_id { get; set; }

        public bool published { get; set; }

        [StringLength(255)]
        public string intro_text { get; set; }

        [StringLength(255)]
        public string full_text { get; set; }

        [StringLength(255)]
        public string video { get; set; }
        [StringLength(255)]
        public string blog_subject { get; set; }

        [StringLength(255)]
        public string gallery { get; set; }

        [StringLength(255)]
        public string extra_fields { get; set; }
        public int? rate { get; set; }

        [StringLength(255)]
        public string extra_fields_search { get; set; }
        public DateTime? created { get; set; }
        public int? created_by { get; set; }

        [StringLength(55)]
        public string created_by_alias { get; set; }
        public int? checked_out { get; set; }
        public DateTime? checked_out_time { get; set; }
        public DateTime? modified { get; set; }
        public int? modified_by { get; set; }
        public DateTime? publish_up { get; set; }
        public DateTime? publish_down { get; set; }
        public bool? trash { get; set; }
        public int? access { get; set; }
        public int? ordering { get; set; }
        public short? featured { get; set; }
        public int? featured_ordering { get; set; }
        public string type { get; set; }
        [StringLength(255)]
        public string image_caption { get; set; }

        [StringLength(255)]
        public string image_credits { get; set; }

        [StringLength(255)]
        public string video_caption { get; set; }

        [StringLength(255)]
        public string video_credits { get; set; }
        public int? hits { get; set; }

        [StringLength(255)]
        public string @params { get; set; }

        [StringLength(255)]
        public string meta_desc { get; set; }

        [StringLength(255)]
        public string meta_data { get; set; }

        [StringLength(255)]
        public string meta_key { get; set; }

        [StringLength(255)]
        public string plugins { get; set; }

        [StringLength(255)]
        public string language { get; set; }
        public string template { get; set; }
        public DateTime? date_post { get; set; }
        public string ListUserView { get; set; }
        public string hash_tag { get; set; }
        public string share { get; set; }
        public string multiple_language { get; set; }
    }

    public class CMSItemModel
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Alias { get; set; }
        public bool Published { get; set; }
        public int? Ordering { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? DatePost { get; set; }
        public DateTime? Modified { get; set; }
        public string Name { get; set; }
        public bool IsRead { get; set; }
    }
}
