using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("URENCO_CAR_COST_HEADER")]
    public class UrencoCarCostHeader
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string CostCode { get; set; }
        public string Title { get; set; }
        public string Note { get; set; }
        public string CarPlate { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Creator { get; set; }
        public DateTime? CreatTime { get; set; }
        public string ApprovedBy { get; set; }
        public DateTime? ApprovedTime { get; set; }

        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
        public string Type { get; set; }
        public string ObjActCode { get; set; }
        public string Status { get; set; }
    }

    public class UrencoCarCostHeaderModel
    {
        public string CostCode { get; set; }
        public string Title { get; set; }
        public string Note { get; set; }
        public string CarPlate { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public string Creator { get; set; }
        public string CreatedDate { get; set; }
        public string ApprovedBy { get; set; }
        public string ApprovedTime { get; set; }
        public string Type { get; set; }
        public string ObjActCode { get; set; }
        public string Status { get; set; }
    }
}
