using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("EDMS_AUDIO_BOOK")]
    public class EDMSAudioBook
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        public int FileID { get; set; }

        public int Index { get; set; }
        
        public string AudioPath { get; set; }
    }
}
