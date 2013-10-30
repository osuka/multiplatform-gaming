var game = game || {};

game.chapters = [];

game.chapters.push( game.BaseLayer.extend({

    init: function () {
        this._super();

        this.addTitle("Chapter 1 - Why?");

        var text = [
            " ",
            "Well, creating a game or app for all possible distributions is HARD.",
            "This can help you jumpstart your project/startup etc.",
            " ",
            "BONUS: Fun!"
        ];
        
        this.addBodyText(text);
        
        this.bodyLabel.touched = function () {
            game.Controller.showNextChapter();
        }

        return true;
    },

}));


game.chapters.push( game.BaseLayer.extend({

    init: function () {
        this._super();

        this.addTitle("Chapter 2 - Caca");

        var text = [
            " ",
            "Hola"
        ];
        
        this.addBodyText(text);
        
        this.bodyLabel.touched = function () {
            game.Controller.showNextChapter();
        }

        return true;
    },

}));
