using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace ESEIM.Models
{
    [Table("RM_VAYXE_BOOK_MATERIAL_DETAILS")]
    public class RmVayxeBookMaterialDetails
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int? BookChkId { get; set; }
        public int? MaterialId { get; set; }
        public int? Amount { get; set; }
        public int? Status { get; set; }
        public DateTime CreatedTime { get; set; }
        public DateTime UpdatedTime { get; set; }
        public int? Flag { get; set; }
        public float? Price { get; set; }
        [StringLength(maximumLength: 255)]
        public string Note { get; set; }
        [StringLength(maximumLength: 255)]
        public string CreatedBy { get; set; }
        [StringLength(maximumLength: 255)]
        public string UpdatedBy { get; set; }
    }
}
