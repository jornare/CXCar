
function ApplicationManager()
{
    /**
        Initialises this object
        @return A reference to the initialised object
    */
    this.startupApplicationManager = function()
    {
        this.startupGameObject();
		this.background3 = new RepeatingGameObject().startupRepeatingGameObject(g_back0, 0, 2, 3, 800, 600, 1);
        this.background2 = new RepeatingGameObject().startupRepeatingGameObject(g_back1, 0, 10, 2, 800, 600, 0.75);        
        this.background = new RepeatingGameObject().startupRepeatingGameObject(g_back2, 0, 0, 1, 1200, 600, 0.5);
        return this;
    }
	
	/**
        Updates the object
        @param dt The time since the last frame in seconds
        @param context The drawing context 
        @param xScroll The global scrolling value of the x axis  
        @param yScroll The global scrolling value of the y axis 
    */
    this.update = function(/**Number*/ dt, /**CanvasRenderingContext2D*/ context, /**Number*/ xScroll, /**Number*/ yScroll)
    {
		g_GameObjectManager.xScroll += 50 * dt;
	}
}
ApplicationManager.prototype = new GameObject