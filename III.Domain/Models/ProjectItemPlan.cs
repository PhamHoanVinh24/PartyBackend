using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("PROJECT_ITEM_PLAN")]
    public class ProjectItemPlan
    {
        public readonly int Draw;

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
   
        public string ItemCode { get; set; }
      
        public string ItemName { get; set; }
      
        public string ItemLevel { get; set; }

       
        public decimal ItemWeight { get; set; }

        
        public string ItemParent { get; set; }

       
        public string ProjectCode { get; set; }

        
        public string DurationTime { get; set; }

        
        public string DurationUnit { get; set; }

        
        public string Cost { get; set; }

        
        public string CostUnit { get; set; }
        //  *
        public DateTime CreatedTime { get; set; }
        public string CreatedBy { get; set; }
        public DateTime UpdatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
    }
}
