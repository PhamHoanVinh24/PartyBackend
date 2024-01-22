using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace ESEIM.Models
{
    [Table("RM_VAYXE_TABLE_COST_DETAILS")]
    public class RmVayxeTableCostDetails
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [StringLength(maximumLength: 100)]
        public string ServiceCode { get; set; }
        public DateTime CreatedTime { get; set; }
        public DateTime UpdatedTime { get; set; }
        public int? TableId{ get; set; }
        [StringLength(maximumLength: 255)]
        public string CreatedBy { get; set; }
        [StringLength(maximumLength: 255)]
        public string UpdatedBy { get; set; }
        public int? Flag { get; set; }
        public int? Status { get; set; }

    }
}
