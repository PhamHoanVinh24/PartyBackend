using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("MATERIAL_ATTRIBUTE")]
    public class MaterialAttribute
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string Attribute { get; set; }

        [StringLength(255)]
        public string AttributeValue { get; set; }

        [StringLength(500)]
        public string Note { get; set; }
        public int? ProductId { get; set; }
    }
}
