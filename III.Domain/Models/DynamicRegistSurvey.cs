using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("DYNAMIC_REGIST_SURVEY")]
    public class EdmsDynamic
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string SurveyCode { get; set; }
        public string GroupCode { get; set; }
        public string GroupName { get; set; }
        public string Title { get; set; }
        public string Repeat { get; set; }
        public string Description { get; set; }
        public bool? Flag { get; set; }
        public string Type { get; set; }
        public string Prioritized { get; set; }
        public string Status { get; set; }
        public string ImageCover { get; set; }
    }
}
