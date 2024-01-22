using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
namespace ESEIM.Models
{
    [Table("RM_VAYXE_MATERIAL_GOODS")]
    public class RmVayxeMaterialGoods
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [StringLength(maximumLength: 100)]
        public string CodeId { get; set; }
        [StringLength(maximumLength: 250)]
        public string ProductName { get; set; }
        [StringLength(maximumLength: 50)]
        public string GroupId { get; set; }
        [StringLength(maximumLength: 50)]
        public string TypeId { get; set; }
        [StringLength(maximumLength: 500)]
        public string Note { get; set; }
        [StringLength(maximumLength: 500)]
        public int? Accessory { get; set; }
        public int? Status { get; set; }
        public DateTime? Created_time { get; set; }
        public DateTime? Updated_time { get; set; }
        public int? Flag { get; set; }
        [StringLength(maximumLength: 255)]
        public string Image { get; set; }
        [StringLength(maximumLength: 20)]
        public string Barcode { get; set; }
    }
}
