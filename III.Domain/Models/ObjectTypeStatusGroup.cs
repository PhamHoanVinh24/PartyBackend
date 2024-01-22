using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("OBJECT_TYPE_STATUS_GROUP")]
    public class ObjectTypeStatusGroup
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        public string ObjectTypeCode { get; set; }

        public string StatusGroupCode { get; set; }
        
    }
}
