using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("company_rule_item")]
    public class CompanyRuleItem
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [StringLength(50)]
        public string ItemCode { get; set; }
        public string Item { get; set; }
        public string Description { get; set; }
        public string Note { get; set; }
        public string Status { get; set; }
        public DateTime? CreateTime { get; set; }
        public string CreateBy { get; set; }
        public DateTime? UpdateTime { get; set; }
        public string UpdateBy { get; set; }
        [StringLength(50)]
        public bool? Flag { get; set; }
    }
}
