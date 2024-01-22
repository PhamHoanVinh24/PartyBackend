using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("APP_MEETING")]
    public class AppMeeting
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string ZoomId { get; set; }
        public string ZoomPasswork { get; set; }
        public string DisplayName { get; set; }
        public string Imei { get; set; }
    }
}
